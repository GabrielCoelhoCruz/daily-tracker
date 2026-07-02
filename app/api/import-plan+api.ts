import {
  MAX_PDF_BYTES,
  isPdfMagic,
  validateAiParsedPlan,
  type AiParsedPlan,
} from "@/utils/aiPlanImport";

/**
 * Importação de plano via PDF: extrai texto do PDF e usa IA para ORGANIZAR
 * (nunca criar) o plano em JSON estruturado. Chave de API só existe aqui,
 * server-side. Nunca logamos o conteúdo do plano — só metadados de tamanho.
 */

type ImportRequestBody = {
  pdfBase64: string;
  fileName?: string;
};

type OpenCodeGoChatResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: { message?: string } | string;
};

const OPENCODE_GO_BASE_URL = process.env.OPENCODE_GO_BASE_URL || "https://opencode.ai/zen/go/v1";
const DEFAULT_OPENCODE_GO_MODEL = "deepseek-v4-pro";

export type ImportPlanResponse =
  | { status: "ok"; result: AiParsedPlan; extractedText: string }
  | { status: "needs_ocr" }
  | { status: "empty" }
  | { status: "ai_failed"; extractedText: string }
  | { status: "error"; error: string };

// ─── Rate limiting (mesmo padrão de analyze+api.ts) ──────────────────────────
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 6;

function isRateLimited(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  requestTimestamps.push(now);
  return false;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── System prompt (server-side, nunca vem do cliente) ───────────────────────

const SYSTEM_PROMPT = `Você está organizando um plano de preparação de fisiculturismo que o usuário JÁ RECEBEU de um coach. Extraia o plano para JSON estruturado.

REGRAS ABSOLUTAS:
- Você NÃO cria dieta, treino, suplementação ou recomendações médicas/de prep novas.
- Você NÃO infere valores ausentes. Se algo não está no texto, retorne null/vazio.
- Você NÃO inventa quantidades, horários, refeições, exercícios ou metas.
- Linhas incertas vão para "unmapped" com um "reason" curto.
- Itens de medicação, hormônios, diuréticos ou manipulação de água/sódio vão SEPARADOS em "sensitiveItems" — NUNCA em refeições, suplementos ou qualquer lista de tarefas.
- Preserve trechos do texto original em "sourceText" sempre que possível.
- Marque itens incertos com confidence "baixa".
- Split de treino (ex.: "Treino ABCDE") vai em "trainingSplit" — nunca como item de refeição.
- Horário de fechamento do dia (ex.: "Fechamento do dia 21:00") vai em "closeoutTime" no formato HH:MM — nunca como item de refeição.
- Água: converta para ml em "waterTargetMl" (3L → 3000; 3,5L → 3500; 3000 ml → 3000).
- Cardio: minutos em "cardioTargetMin" ("40 min" → 40). Se não estiver claro se é diário ou semanal, "cardioTargetType" = null.
- Responda APENAS com o JSON, sem markdown, sem comentários.

SCHEMA (todos os campos obrigatórios; use null/[] quando ausente):
{
  "source": "pdf_ai",
  "title": string|null,
  "summary": string|null,
  "confidence": "alta"|"média"|"baixa",
  "waterTargetMl": number|null,
  "cardioTargetMin": number|null,
  "cardioTargetType": "daily"|"weekly"|null,
  "closeoutTime": string|null,
  "trainingSplit": string|null,
  "trainingDays": [{"weekday": string|null, "label": string|null, "muscleGroups": string[], "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}],
  "mealPeriods": [{"name": string, "timeWindow": string|null, "items": [{"title": string, "quantity": string|null, "unit": string|null, "required": boolean, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}], "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}],
  "supplements": [{"title": string, "dosage": string|null, "timing": string|null, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}],
  "freeMeal": {"enabled": boolean, "frequency": string|null, "preferredDay": string|null, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}|null,
  "checkInInstructions": {"frequency": string|null, "preferredDay": string|null, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}|null,
  "observations": [{"text": string, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}],
  "sensitiveItems": [{"text": string, "category": "medicamento"|"hormonal"|"diurético"|"manipulação de água/sódio"|"outro sensível", "sourceText": string|null}],
  "unmapped": [{"text": string, "reason": string|null}],
  "rawTextPreview": string|null
}`;

// ─── Extração de texto do PDF ────────────────────────────────────────────────

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  // Preserva quebras de linha entre páginas/linhas; normaliza só o excesso.
  return (Array.isArray(text) ? text.join("\n") : text)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripJsonFences(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : raw).trim();
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited()) {
    return jsonResponse(
      { status: "error", error: "Rate limit exceeded. Try again in a minute." },
      429,
    );
  }

  const apiKey = process.env.OPENCODE_GO_API_KEY;
  if (!apiKey) {
    return jsonResponse({ status: "error", error: "OPENCODE_GO_API_KEY not configured" }, 500);
  }

  let body: ImportRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ status: "error", error: "Invalid JSON body" }, 400);
  }

  if (typeof body.pdfBase64 !== "string" || body.pdfBase64.length === 0) {
    return jsonResponse({ status: "error", error: "pdfBase64 is required" }, 400);
  }

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(Buffer.from(body.pdfBase64, "base64"));
  } catch {
    return jsonResponse({ status: "error", error: "Invalid base64 payload" }, 400);
  }

  if (bytes.byteLength > MAX_PDF_BYTES) {
    return jsonResponse({ status: "error", error: "file_too_large" }, 413);
  }
  if (!isPdfMagic(bytes)) {
    return jsonResponse({ status: "error", error: "not_a_pdf" }, 415);
  }

  let extractedText: string;
  try {
    extractedText = await extractPdfText(bytes);
  } catch {
    // Não logamos conteúdo — apenas o fato e o tamanho do arquivo.
    console.warn(`[import-plan] PDF extraction failed (${bytes.byteLength} bytes)`);
    return jsonResponse({ status: "error", error: "pdf_unreadable" }, 422);
  }

  if (extractedText.length === 0) {
    return jsonResponse({ status: "needs_ocr" });
  }
  if (extractedText.length < 30) {
    return jsonResponse({ status: "empty" });
  }

  // Debug: apenas tamanho, nunca o texto em si (planos contêm dados pessoais).
  console.info(`[import-plan] extracted ${extractedText.length} chars`);

  const model = process.env.OPENCODE_GO_MODEL || DEFAULT_OPENCODE_GO_MODEL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(`${OPENCODE_GO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Organize este plano em JSON conforme o schema:\n\n${extractedText}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[import-plan] AI request failed (${response.status})`);
      return jsonResponse({ status: "ai_failed", extractedText });
    }

    const data = (await response.json()) as OpenCodeGoChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== "string") {
      return jsonResponse({ status: "ai_failed", extractedText });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripJsonFences(text));
    } catch {
      console.warn("[import-plan] AI returned invalid JSON");
      return jsonResponse({ status: "ai_failed", extractedText });
    }

    const result = validateAiParsedPlan(parsedJson);
    if (!result || (result.mealPeriods.length === 0 && result.trainingDays.length === 0 && result.supplements.length === 0)) {
      return jsonResponse({ status: "ai_failed", extractedText });
    }

    result.source = "pdf_ai";
    result.rawTextPreview = extractedText.slice(0, 400);
    return jsonResponse({ status: "ok", result, extractedText });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse({ status: "ai_failed", extractedText });
    }
    console.warn("[import-plan] AI request error");
    return jsonResponse({ status: "ai_failed", extractedText });
  } finally {
    clearTimeout(timeoutId);
  }
}
