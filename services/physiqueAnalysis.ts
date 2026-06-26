import { File } from "expo-file-system";
import type { TargetCategory } from "@/stores/usePhysiqueStore";
import { useAthleteStore } from "@/stores/useAthleteStore";

export const CATEGORY_LABELS: Record<TargetCategory, string> = {
  mens_physique: "Men's Physique",
  classic_physique: "Classic Physique",
  bodybuilding: "Bodybuilding",
  bikini: "Bikini",
  wellness: "Wellness",
  figure: "Figure",
  womens_physique: "Women's Physique",
  womens_bodybuilding: "Women's Bodybuilding",
  undecided: "A definir (sugira)",
};

// System prompt is built server-side in app/api/analyze+api.ts
// to keep IFBB/NPC data and prompt logic out of the client bundle.

type AnalysisContext = {
  week: number;
  weight: number;
  previousWeight?: number;
  notes?: string;
  previousPhotoPaths?: string[];
  targetCategory: TargetCategory;
  weeksToCompetition?: number;
  poseLabels?: string[];
};

async function readPhotoBase64(path: string): Promise<string> {
  const file = new File(path);
  return file.base64();
}

function formatCompetitionTimeline(weeks?: number): string {
  return weeks != null ? `${weeks} semanas` : "sem data definida";
}

function buildFullPrompt(ctx: AnalysisContext): string {
  const delta =
    ctx.previousWeight != null
      ? ` (${(ctx.weight - ctx.previousWeight) >= 0 ? "+" : ""}${(ctx.weight - ctx.previousWeight).toFixed(1)}kg)`
      : "";
  const prev = ctx.previousWeight != null ? `\nPeso semana anterior: ${ctx.previousWeight}kg` : "";
  return `## Check-in de Progresso — Semana ${ctx.week}\n\nPeso atual: ${ctx.weight}kg${delta}${prev}\nCategoria alvo: ${CATEGORY_LABELS[ctx.targetCategory]}\nSemanas para competição: ${formatCompetitionTimeline(ctx.weeksToCompetition)}\n\nObservações: ${ctx.notes || "Nenhuma"}\n\nAnalise meu condicionamento atual seguindo o protocolo completo.`;
}

function buildComparativePrompt(ctx: AnalysisContext): string {
  const delta = ctx.previousWeight != null
    ? (ctx.weight - ctx.previousWeight).toFixed(1)
    : "N/A";
  return `## Check-in Comparativo — Semana ${ctx.week} vs Semana ${ctx.week - 1}\n\nPeso atual: ${ctx.weight}kg\nPeso anterior: ${ctx.previousWeight ?? "N/A"}kg\nDelta: ${delta}kg\nCategoria alvo: ${CATEGORY_LABELS[ctx.targetCategory]}\nSemanas para competição: ${formatCompetitionTimeline(ctx.weeksToCompetition)}\n\nObservações: ${ctx.notes || "Nenhuma"}\n\nAnalise o progresso seguindo o protocolo completo com ênfase no comparativo e na recomendação de categoria.`;
}

function buildQuickPrompt(ctx: AnalysisContext): string {
  return `## Quick Check\n\nPeso: ${ctx.weight}kg\nCategoria alvo: ${CATEGORY_LABELS[ctx.targetCategory]}\n\nMe dê uma avaliação rápida e direta: como está o condicionamento? O cutting está no ritmo? O que chama mais atenção positiva e negativamente?`;
}

function buildPosingPrompt(ctx: AnalysisContext): string {
  const poseList = ctx.poseLabels?.length
    ? `\nPoses fotografadas: ${ctx.poseLabels.join(", ")}`
    : "";
  return `## Avaliação de Posing\n\nCategoria alvo: ${CATEGORY_LABELS[ctx.targetCategory]}${poseList}\n\nAvalie cada pose: execução, o que favorece, o que expõe, como melhorar. Sugira a melhor favorite classic pose baseado no meu físico.`;
}

export type StageReadinessLevel = "longe" | "progredindo" | "se_aproximando" | "quase_pronto" | "stage_ready";

export const STAGE_READINESS_LABELS: Record<StageReadinessLevel, string> = {
  longe: "Longe",
  progredindo: "Progredindo",
  se_aproximando: "Se aproximando",
  quase_pronto: "Quase pronto",
  stage_ready: "Stage Ready",
};

export const STAGE_READINESS_ORDER: StageReadinessLevel[] = [
  "longe", "progredindo", "se_aproximando", "quase_pronto", "stage_ready",
];

export type PhysiqueScores = {
  overallConditioning?: number;
  stageReadiness?: StageReadinessLevel;
  vTaper?: number;
};

type AnalysisResult = {
  analysis: string;
  scores?: PhysiqueScores;
};

function parseScores(raw: string): { analysis: string; scores?: PhysiqueScores } {
  const match = raw.match(/```json\s*(\{[\s\S]*?\})\s*```\s*$/);
  if (!match) return { analysis: raw };

  try {
    const parsed = JSON.parse(match[1]) as Record<string, unknown>;
    const scores: PhysiqueScores = {};
    if (typeof parsed.overallConditioning === "number") scores.overallConditioning = parsed.overallConditioning;
    if (typeof parsed.stageReadiness === "string" && STAGE_READINESS_ORDER.includes(parsed.stageReadiness as StageReadinessLevel)) {
      scores.stageReadiness = parsed.stageReadiness as StageReadinessLevel;
    }
    if (typeof parsed.vTaper === "number") scores.vTaper = parsed.vTaper;

    const analysis = raw.slice(0, match.index).trimEnd();
    return {
      analysis,
      scores: Object.keys(scores).length > 0 ? scores : undefined,
    };
  } catch {
    return { analysis: raw };
  }
}

export async function analyzePhysique(
  photoPaths: string[],
  mode: "full" | "comparative" | "quick" | "posing",
  context: AnalysisContext,
  timeout: number = 90_000
): Promise<AnalysisResult> {
  const photos: { base64: string; label: string }[] = [];

  for (let i = 0; i < photoPaths.length; i++) {
    const data = await readPhotoBase64(photoPaths[i]);
    photos.push({ base64: data, label: `[ATUAL] Foto ${i + 1}` });
  }

  if (mode === "comparative" && context.previousPhotoPaths) {
    for (let i = 0; i < context.previousPhotoPaths.length; i++) {
      const data = await readPhotoBase64(context.previousPhotoPaths[i]);
      photos.push({ base64: data, label: `[ANTERIOR] Foto ${i + 1}` });
    }
  }

  let userPrompt: string;
  switch (mode) {
    case "comparative":
      userPrompt = buildComparativePrompt(context);
      break;
    case "quick":
      userPrompt = buildQuickPrompt(context);
      break;
    case "posing":
      userPrompt = buildPosingPrompt(context);
      break;
    default:
      userPrompt = buildFullPrompt(context);
  }

  const athlete = useAthleteStore.getState();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photos,
        userPrompt,
        athleteProfile: {
          name: athlete.name,
          gender: athlete.gender,
          heightCm: athlete.heightCm,
          currentWeightKg: athlete.currentWeightKg,
          phase: athlete.phase || undefined,
          coachName: athlete.coachName || undefined,
          competitiveExperience: athlete.competitiveExperience || undefined,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error((errorData as { error?: string }).error || `Erro na API (${response.status})`);
    }

    const data = await response.json();
    const text = (data as { analysis: string }).analysis;
    if (typeof text !== "string") {
      throw new Error("Resposta inesperada da API. Tente novamente.");
    }
    return parseScores(text);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout - a análise demorou mais de ${Math.round(timeout / 1000)} segundos. Tente novamente.`);
    }
    if (error instanceof TypeError) {
      throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
