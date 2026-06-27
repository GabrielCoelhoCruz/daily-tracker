export type StageReadinessLevel =
  | "longe"
  | "progredindo"
  | "se_aproximando"
  | "quase_pronto"
  | "stage_ready";

export const STAGE_READINESS_LABELS: Record<StageReadinessLevel, string> = {
  longe: "Longe",
  progredindo: "Progredindo",
  se_aproximando: "Se aproximando",
  quase_pronto: "Quase pronto",
  stage_ready: "Stage Ready",
};

export const STAGE_READINESS_ORDER: StageReadinessLevel[] = [
  "longe",
  "progredindo",
  "se_aproximando",
  "quase_pronto",
  "stage_ready",
];
