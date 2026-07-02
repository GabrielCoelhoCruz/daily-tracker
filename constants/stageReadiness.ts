export type StageReadinessLevel =
  | "longe"
  | "progredindo"
  | "se_aproximando"
  | "quase_pronto"
  | "stage_ready";

// Labels observacionais — nunca veredito de juiz (design system v1.1 §5.6).
// Proibido na UI: "Palco-ready", "Stage Ready", "Você está pronto".
export const STAGE_READINESS_LABELS: Record<StageReadinessLevel, string> = {
  longe: "Ainda precisa lapidar",
  progredindo: "Evolução em andamento",
  se_aproximando: "Se aproximando",
  quase_pronto: "Condição competitiva",
  stage_ready: "Sinal forte para palco",
};

export const STAGE_READINESS_ORDER: StageReadinessLevel[] = [
  "longe",
  "progredindo",
  "se_aproximando",
  "quase_pronto",
  "stage_ready",
];
