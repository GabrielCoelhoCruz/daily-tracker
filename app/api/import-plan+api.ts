import {
  MAX_PDF_BYTES,
  extractAiJsonPayload,
  isPdfMagic,
  parserResultToAiPlan,
  repairTruncatedAiJson,
  validateAiParsedPlan,
  type AiParsedPlan,
} from "@/utils/aiPlanImport";
import { parseCoachPlan } from "@/utils/planImportUtils";
import {
  formatSectionsForAi,
  understandPdfPlan,
} from "@/utils/pdfPlanUnderstanding";

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
    finish_reason?: string;
  }[];
  error?: { message?: string } | string;
};

type ExtractedPdfText = {
  text: string;
  pageTexts: string[];
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

function buildParserFallbackFromPlan(
  parsedPlan: AiParsedPlan,
  extractedText: string,
): AiParsedPlan | null {
  if (parsedPlan.mealPeriods.length > 0 || parsedPlan.trainingPlan !== null) {
    return parsedPlan;
  }
  const parsed = parseCoachPlan(extractedText);
  if (parsed.plano.periodos.length === 0) return null;
  const fallback = parserResultToAiPlan(parsed);
  fallback.rawTextPreview = extractedText.slice(0, 400);
  return fallback;
}

export function buildParserFallback(extractedText: string, pageTexts?: string[]): AiParsedPlan | null {
  return buildParserFallbackFromPlan(
    understandPdfPlan(extractedText, pageTexts).parsedPlan,
    extractedText,
  );
}

function parserFallbackResponse(
  extractedText: string,
  reason: string,
  pageTexts?: string[],
  precomputedFallback?: AiParsedPlan | null,
): Response {
  const fallback =
    precomputedFallback !== undefined
      ? precomputedFallback
      : buildParserFallback(extractedText, pageTexts);
  if (fallback) {
    console.warn(`[import-plan] ${reason}; using parser fallback`);
    return jsonResponse({ status: "ok", result: fallback, extractedText });
  }

  console.warn(`[import-plan] ${reason}; parser fallback unavailable`);
  return jsonResponse({ status: "ai_failed", extractedText });
}

function mergeAiWithParserResult(aiResult: AiParsedPlan, parserResult: AiParsedPlan | null): AiParsedPlan {
  if (!parserResult) return aiResult;

  return {
    ...aiResult,
    title: parserResult.title ?? aiResult.title,
    waterTargetMl: parserResult.waterTargetMl ?? aiResult.waterTargetMl,
    cardioTargetMin: parserResult.cardioTargetMin ?? aiResult.cardioTargetMin,
    cardioTargetType: parserResult.cardioTargetType ?? aiResult.cardioTargetType,
    closeoutTime: parserResult.closeoutTime ?? aiResult.closeoutTime,
    trainingSplit: parserResult.trainingSplit ?? aiResult.trainingSplit,
    trainingDays:
      parserResult.trainingDays.length > 0 ? parserResult.trainingDays : aiResult.trainingDays,
    mealPeriods:
      parserResult.mealPeriods.length > 0 ? parserResult.mealPeriods : aiResult.mealPeriods,
    supplements:
      parserResult.supplements.length > 0 ? parserResult.supplements : aiResult.supplements,
    freeMeal: parserResult.freeMeal ?? aiResult.freeMeal,
    checkInInstructions: parserResult.checkInInstructions ?? aiResult.checkInInstructions,
    trainingPlan: parserResult.trainingPlan ?? aiResult.trainingPlan,
    coachTips: parserResult.coachTips.length > 0 ? parserResult.coachTips : aiResult.coachTips,
    nutritionGuidance:
      parserResult.nutritionGuidance.length > 0
        ? parserResult.nutritionGuidance
        : aiResult.nutritionGuidance,
    sensitiveItems:
      parserResult.sensitiveItems.length > 0
        ? parserResult.sensitiveItems
        : aiResult.sensitiveItems,
    observations:
      parserResult.observations.length > 0 ? parserResult.observations : aiResult.observations,
    unmapped: parserResult.unmapped.length > 0 ? parserResult.unmapped : aiResult.unmapped,
    rawTextPreview: parserResult.rawTextPreview ?? aiResult.rawTextPreview,
  };
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
- Treino detalhado vai em "trainingPlan"; glossário/observações de WS/TS/BS/CS vão em "trainingPlan.guidance", não como exercícios.
- Dicas de nutrição e observações do coach vão em "nutritionGuidance"/"coachTips", não em refeições.
- "sourceText" deve ser um trecho curto (máx. 140 caracteres) — nunca parágrafos inteiros.
- Responda APENAS com o JSON, sem markdown, sem comentários. A resposta começa com "{" e termina com "}".

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
  "rawTextPreview": string|null,
  "trainingPlan": {"split": string|null, "groups": [{"code": string, "label": string, "exercises": [{"name": string, "rawPrescription": string|null, "sets": [{"type": "WS"|"TS"|"BS"|"CS"|"unknown", "count": number, "reps": string|null, "notes": string|null, "sourceText": string|null}], "notes": string|null, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}], "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}], "guidance": string[], "glossary": {}, "sourceText": string|null, "confidence": "alta"|"média"|"baixa"}|null,
  "coachTips": string[],
  "nutritionGuidance": string[]
}`;

// ─── Extração de texto do PDF ────────────────────────────────────────────────

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(bytes: Uint8Array): Promise<ExtractedPdfText> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  // Preserva quebras de linha entre páginas/linhas; normaliza só o excesso.
  const pageTexts = (Array.isArray(text) ? text : [text]).map((pageText) =>
    normalizeExtractedText(pageText),
  );

  return {
    text: normalizeExtractedText(pageTexts.join("\n")),
    pageTexts,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited()) {
    return jsonResponse(
      { status: "error", error: "Rate limit exceeded. Try again in a minute." },
      429,
    );
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
  let pageTexts: string[];
  try {
    const extracted = await extractPdfText(bytes);
    extractedText = extracted.text;
    pageTexts = extracted.pageTexts;
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

  const apiKey = process.env.OPENCODE_GO_API_KEY;
  if (!apiKey) {
    return parserFallbackResponse(extractedText, "OPENCODE_GO_API_KEY not configured", pageTexts);
  }

  const model = process.env.OPENCODE_GO_MODEL || DEFAULT_OPENCODE_GO_MODEL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);
  const understood = understandPdfPlan(extractedText, pageTexts);
  const parserResult = buildParserFallbackFromPlan(understood.parsedPlan, extractedText);
  const sectionedContext = formatSectionsForAi(understood.sections);

  // O modelo às vezes devolve prosa ou JSON truncado no primeiro disparo;
  // uma segunda tentativa com instrução corretiva resolve a maioria dos casos.
  const MAX_AI_ATTEMPTS = 2;
  let failureReason = "AI request error";

  try {
    for (let attempt = 1; attempt <= MAX_AI_ATTEMPTS; attempt += 1) {
      const aiAssistInstruction =
        "A extracao deterministica do app e a fonte de verdade. Use IA apenas para limpar rotulos, classificar ambiguidades e separar contexto de checklist.";
      const userContent =
        attempt === 1
          ? `Organize este plano em JSON conforme o schema usando as seções classificadas abaixo. Trate dicas/orientações como contexto, não checklist:\n\n${sectionedContext}`
          : `Organize este plano em JSON conforme o schema usando as seções classificadas abaixo. IMPORTANTE: responda SOMENTE com o objeto JSON completo — comece com "{" e termine com "}", sem texto antes ou depois:\n\n${sectionedContext}`;

      const assistedUserContent = `${aiAssistInstruction}\n\n${userContent}`;

      const response = await fetch(`${OPENCODE_GO_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: assistedUserContent },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        failureReason = `AI request failed (${response.status})`;
        continue;
      }

      const data = (await response.json()) as OpenCodeGoChatResponse;
      const choice = data.choices?.[0];
      const text = choice?.message?.content;
      if (typeof text !== "string") {
        failureReason = "AI response missing content";
        continue;
      }

      // Metadados apenas — nunca o conteúdo (dados pessoais do plano).
      if (choice?.finish_reason && choice.finish_reason !== "stop") {
        console.warn(
          `[import-plan] AI finish_reason=${choice.finish_reason}, ${text.length} chars (attempt ${attempt})`,
        );
      }

      // JSON truncado por max_tokens nunca fecha as chaves — repara antes
      // de desistir (o validador descarta qualquer entrada incompleta).
      const jsonPayload = extractAiJsonPayload(text) ?? repairTruncatedAiJson(text);
      if (!jsonPayload) {
        failureReason = "AI response had no JSON object";
        continue;
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonPayload);
      } catch {
        failureReason = "AI JSON parse failed";
        continue;
      }

      const result = validateAiParsedPlan(parsedJson);
      if (
        !result ||
        (result.mealPeriods.length === 0 &&
          result.trainingDays.length === 0 &&
          result.supplements.length === 0 &&
          result.trainingPlan === null)
      ) {
        failureReason = "AI response did not match the plan schema";
        continue;
      }

      const mergedResult = mergeAiWithParserResult(result, parserResult);
      mergedResult.source = "pdf_ai";
      mergedResult.rawTextPreview = extractedText.slice(0, 400);
      return jsonResponse({ status: "ok", result: mergedResult, extractedText });
    }

    return parserFallbackResponse(extractedText, failureReason, pageTexts, parserResult);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return parserFallbackResponse(extractedText, "AI request timed out", pageTexts, parserResult);
    }
    return parserFallbackResponse(extractedText, "AI request error", pageTexts, parserResult);
  } finally {
    clearTimeout(timeoutId);
  }
}
