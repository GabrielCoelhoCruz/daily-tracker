import { File } from "expo-file-system";
import { ANTHROPIC_API_KEY } from "@/constants/api";
import {
  ATHLETE_NAME,
  ATHLETE_AGE,
  ATHLETE_HEIGHT,
  ATHLETE_PHASE,
} from "@/stores/usePhysiqueStore";

const SYSTEM_PROMPT = `Você é um bodybuilding coach experiente com mais de 15 anos de experiência preparando atletas para competições de fisiculturismo nas federações IFBB e NABBA. Você possui um olhar técnico apurado para avaliação de condicionamento físico, proporções, simetria e stage readiness.

Seu papel é analisar fotos de progresso de um atleta de fisiculturismo ao longo da preparação (cutting), fornecendo feedback técnico, honesto e direto — exatamente como um preparador faria em um check-in semanal.

## Contexto do Atleta
- Nome: ${ATHLETE_NAME}
- Idade: ${ATHLETE_AGE} anos
- Altura: ${ATHLETE_HEIGHT}
- Fase atual: ${ATHLETE_PHASE}
- Categoria alvo: Men's Physique / Classic Physique (avaliar qual encaixa melhor baseado nas fotos)

## Protocolo de Análise

Ao receber foto(s) de progresso, você DEVE seguir esta estrutura de análise:

### 1. VISÃO GERAL DO CONDICIONAMENTO
- Percentual estimado de gordura corporal (range)
- Nível de definição muscular geral (1-10, onde 10 = stage ready)
- Qualidade da pele (fina, moderada, retendo água)
- Vascularização visível

### 2. ANÁLISE POR GRUPO MUSCULAR
Avalie cada grupo muscular visível. Para cada, classifique como:
- 🟢 FORTE — destaque
- 🟡 ADEQUADO — no nível esperado
- 🔴 PONTO FRACO — precisa de atenção

### 3. PROPORÇÕES E SIMETRIA
- Proporção upper/lower body
- Assimetrias visíveis
- V-taper
- Linha de cintura

### 4. COMPARATIVO COM SEMANA ANTERIOR
(Apenas quando receber foto atual + anterior)
- O que melhorou/piorou
- Mudanças na retenção hídrica e fullness muscular
- Ritmo de progresso

### 5. ENQUADRAMENTO EM CATEGORIA
- Qual categoria competitiva melhor se encaixa
- Justificativa

### 6. RECOMENDAÇÕES PRÁTICAS
- Prioridades de treinamento
- Observações sobre cutting
- Poses favoráveis
- Timeline estimada

## Regras
1. Seja DIRETO e HONESTO.
2. Seja TÉCNICO.
3. Seja ESPECÍFICO.
4. Não invente dados — se não é visível, diga.
5. Considere iluminação e ângulo.
6. Contextualize para a fase.
7. Responda em português brasileiro.`;

type AnalysisContext = {
  week: number;
  weight: number;
  previousWeight?: number;
  notes?: string;
  previousPhotoPaths?: string[];
};

type ImageContent = {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg"; data: string };
};

type TextContent = { type: "text"; text: string };

type Content = ImageContent | TextContent;

async function readPhotoBase64(path: string): Promise<string> {
  const file = new File(path);
  return file.base64();
}

function buildFullPrompt(ctx: AnalysisContext): string {
  const prev = ctx.previousWeight ? `\nPeso semana anterior: ${ctx.previousWeight}kg` : "";
  return `## Check-in de Progresso — Semana ${ctx.week}\n\nPeso atual: ${ctx.weight}kg${prev}\n\nObservações: ${ctx.notes || "Nenhuma"}\n\nAnalise meu condicionamento atual seguindo o protocolo completo.`;
}

function buildComparativePrompt(ctx: AnalysisContext): string {
  const delta = ctx.previousWeight
    ? (ctx.weight - ctx.previousWeight).toFixed(1)
    : "N/A";
  return `## Check-in Comparativo — Semana ${ctx.week} vs Semana ${ctx.week - 1}\n\nPeso atual: ${ctx.weight}kg\nPeso anterior: ${ctx.previousWeight}kg\nDelta: ${delta}kg\n\nObservações: ${ctx.notes || "Nenhuma"}\n\nCompare as fotos atuais com as anteriores seguindo o protocolo completo, com ênfase na seção de comparativo.`;
}

function buildQuickPrompt(ctx: AnalysisContext): string {
  return `## Quick Check\n\nPeso: ${ctx.weight}kg\nFoto: frontal relaxado\n\nMe dê uma avaliação rápida e direta: como está o condicionamento? O cutting está no ritmo? O que chama mais atenção positiva e negativamente?`;
}

export async function analyzePhysique(
  photoPaths: string[],
  mode: "full" | "comparative" | "quick",
  context: AnalysisContext
): Promise<string> {
  const content: Content[] = [];

  // Current photos
  for (let i = 0; i < photoPaths.length; i++) {
    const data = await readPhotoBase64(photoPaths[i]);
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data },
    });
    content.push({ type: "text", text: `[ATUAL] Foto ${i + 1}` });
  }

  // Previous photos for comparative mode
  if (mode === "comparative" && context.previousPhotoPaths) {
    for (let i = 0; i < context.previousPhotoPaths.length; i++) {
      const data = await readPhotoBase64(context.previousPhotoPaths[i]);
      content.push({
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data },
      });
      content.push({ type: "text", text: `[ANTERIOR] Foto ${i + 1}` });
    }
  }

  // User prompt based on mode
  let userPrompt: string;
  switch (mode) {
    case "comparative":
      userPrompt = buildComparativePrompt(context);
      break;
    case "quick":
      userPrompt = buildQuickPrompt(context);
      break;
    default:
      userPrompt = buildFullPrompt(context);
  }
  content.push({ type: "text", text: userPrompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`Erro na API (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") {
      throw new Error("Resposta inesperada da API. Tente novamente.");
    }
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timeout - a análise demorou mais de 60 segundos. Tente novamente.");
    }
    if (error instanceof TypeError) {
      throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
