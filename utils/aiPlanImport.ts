import type { Categoria, ItemDoPlano, Periodo, Plano } from "@/data/plano";
import type { Serie, Treino } from "@/data/treinos";
import type { ParsedPlanResult } from "@/utils/planImportUtils";

/**
 * Schema e validação da importação assistida por IA (PDF do coach).
 * A IA apenas ORGANIZA um plano que o usuário já recebeu — nunca cria,
 * nunca inventa valores. Tudo aqui é puro/testável e roda tanto no
 * cliente quanto na rota de API (validação server-side antes de responder).
 */

export type AiConfidence = "alta" | "média" | "baixa";

export type AiMealItem = {
  title: string;
  quantity: string | null;
  unit: string | null;
  required: boolean;
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiMealPeriod = {
  name: string;
  timeWindow: string | null;
  items: AiMealItem[];
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiTrainingDay = {
  weekday: string | null;
  label: string | null;
  muscleGroups: string[];
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiTrainingSet = {
  type: "WS" | "TS" | "BS" | "CS" | "unknown";
  count: number;
  reps: string | null;
  notes: string | null;
  sourceText: string | null;
};

export type AiTrainingExercise = {
  name: string;
  rawPrescription: string | null;
  sets: AiTrainingSet[];
  notes: string | null;
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiTrainingGroup = {
  code: string;
  label: string;
  exercises: AiTrainingExercise[];
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiTrainingPlan = {
  split: string | null;
  groups: AiTrainingGroup[];
  guidance: string[];
  glossary: Record<string, string>;
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiSupplement = {
  title: string;
  dosage: string | null;
  timing: string | null;
  sourceText: string | null;
  confidence: AiConfidence;
};

export type AiSensitiveCategory =
  | "medicamento"
  | "hormonal"
  | "diurético"
  | "manipulação de água/sódio"
  | "outro sensível";

export type AiSensitiveItem = {
  text: string;
  category: AiSensitiveCategory;
  sourceText: string | null;
};

export type AiUnmappedLine = {
  text: string;
  reason: string | null;
};

export type AiParsedPlan = {
  source: "pdf_ai" | "paste_ai" | "paste_parser";
  title: string | null;
  summary: string | null;
  confidence: AiConfidence;
  waterTargetMl: number | null;
  cardioTargetMin: number | null;
  cardioTargetType: "daily" | "weekly" | null;
  closeoutTime: string | null;
  trainingSplit: string | null;
  trainingDays: AiTrainingDay[];
  mealPeriods: AiMealPeriod[];
  supplements: AiSupplement[];
  freeMeal: {
    enabled: boolean;
    frequency: string | null;
    preferredDay: string | null;
    sourceText: string | null;
    confidence: AiConfidence;
  } | null;
  checkInInstructions: {
    frequency: string | null;
    preferredDay: string | null;
    sourceText: string | null;
    confidence: AiConfidence;
  } | null;
  observations: Array<{
    text: string;
    sourceText: string | null;
    confidence: AiConfidence;
  }>;
  sensitiveItems: AiSensitiveItem[];
  unmapped: AiUnmappedLine[];
  rawTextPreview: string | null;
  trainingPlan: AiTrainingPlan | null;
  coachTips: string[];
  nutritionGuidance: string[];
};

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** Assinatura mágica de PDF: "%PDF". */
export function isPdfMagic(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

export function extractAiJsonPayload(raw: string): string | null {
  const trimmed = raw.trim().replace(/^\uFEFF/, "");
  const fenced = trimmed.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : trimmed).trim();
  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < candidate.length; i += 1) {
    const char = candidate[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return candidate.slice(start, i + 1).trim();
      }
    }
  }

  return null;
}

/**
 * Fecha strings/chaves/colchetes abertos de um JSON truncado (ex.: resposta
 * cortada por max_tokens). Retorna null se o aninhamento estiver corrompido.
 */
function closeJsonStructures(text: string): string | null {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      if (inString) escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") stack.push("}");
    else if (char === "[") stack.push("]");
    else if (char === "}" || char === "]") {
      if (stack.pop() !== char) return null;
    }
  }

  let repaired = text;
  if (inString) repaired += '"';
  repaired = repaired.replace(/,\s*$/, "");
  return repaired + stack.reverse().join("");
}

/**
 * Recupera um objeto JSON de uma resposta truncada da IA: fecha estruturas
 * abertas e, se ainda inválido, recua até o último separador e tenta de novo.
 * Só retorna string que passa em JSON.parse; caso contrário, null.
 */
export function repairTruncatedAiJson(raw: string): string | null {
  const trimmed = raw.trim().replace(/^\uFEFF/, "");
  const fenced = trimmed.match(/```(?:json|JSON)?\s*([\s\S]*?)(?:```|$)/);
  const candidate = (fenced ? fenced[1] : trimmed).trim();
  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let text = candidate.slice(start);
  for (let attempt = 0; attempt < 60 && text.length > 1; attempt += 1) {
    const closed = closeJsonStructures(text);
    if (closed) {
      try {
        JSON.parse(closed);
        return closed;
      } catch {
        // Prefixo ainda inválido (ex.: `"chave":` pendurada) — recua e tenta.
      }
    }
    const cut = Math.max(
      text.lastIndexOf(","),
      text.lastIndexOf("{"),
      text.lastIndexOf("["),
    );
    if (cut <= 0) return null;
    text = text.slice(0, cut);
  }
  return null;
}

// ─── Normalizadores (nunca inventam valores; inválido → null) ────────────────

/** "3L" → 3000 · "3,5L" → 3500 · "3000 ml" → 3000 · 3000 → 3000. */
export function normalizeWaterMl(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input) && input > 0) {
    // Valores pequenos vieram em litros por engano do modelo.
    return input <= 20 ? Math.round(input * 1000) : Math.round(input);
  }
  if (typeof input === "string") {
    const m = input.match(/(\d+(?:[.,]\d+)?)\s*(ml|l|litros?)?/i);
    if (!m) return null;
    const value = Number(m[1].replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return null;
    const unit = (m[2] ?? (value <= 20 ? "l" : "ml")).toLowerCase();
    return unit.startsWith("l") ? Math.round(value * 1000) : Math.round(value);
  }
  return null;
}

/** "40 min" → 40 · 40 → 40. */
export function normalizeCardioMin(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input) && input > 0) {
    return Math.round(input);
  }
  if (typeof input === "string") {
    const m = input.match(/(\d+)\s*(?:min|minutos?)?/i);
    if (!m) return null;
    const value = Number(m[1]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  return null;
}

/** "21:00" · "21h" · "21h30" · "21" → "21:00"/"21:30". Inválido → null. */
export function normalizeCloseoutTime(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const m = input.trim().match(/^(\d{1,2})(?:[:h](\d{2})?)?$/i);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** "Treino ABCDE" · "abcde" → "ABCDE". Aceita 2–7 letras A–G. */
export function normalizeTrainingSplit(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const m = input.trim().match(/\b([A-Ga-g]{2,7})\b\s*$/);
  if (!m) return null;
  const split = m[1].toUpperCase();
  // Split real usa letras sequenciais a partir de A (evita capturar palavras).
  return /^A[B-G]*$/.test(split) && split.length >= 2 ? split : null;
}

// ─── Validação do JSON retornado pela IA ─────────────────────────────────────

const CONFIDENCES: AiConfidence[] = ["alta", "média", "baixa"];
const SENSITIVE_CATEGORIES: AiSensitiveCategory[] = [
  "medicamento",
  "hormonal",
  "diurético",
  "manipulação de água/sódio",
  "outro sensível",
];

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function asConfidence(v: unknown): AiConfidence {
  return CONFIDENCES.includes(v as AiConfidence) ? (v as AiConfidence) : "baixa";
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  return asArray(v)
    .map((item) => asString(item))
    .filter((item): item is string => item !== null);
}

function asTrainingSetType(v: unknown): AiTrainingSet["type"] {
  return v === "WS" || v === "TS" || v === "BS" || v === "CS" ? v : "unknown";
}

function asPositiveInteger(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0
    ? Math.round(v)
    : 1;
}

function asTrainingPlan(v: unknown): AiTrainingPlan | null {
  if (!isRecord(v)) return null;

  const groups: AiTrainingGroup[] = asArray(v.groups)
    .filter(isRecord)
    .map((group) => {
      const code = (asString(group.code) ?? "").toUpperCase();
      const exercises: AiTrainingExercise[] = asArray(group.exercises)
        .filter(isRecord)
        .map((exercise) => {
          const sets: AiTrainingSet[] = asArray(exercise.sets)
            .filter(isRecord)
            .map((set) => ({
              type: asTrainingSetType(set.type),
              count: asPositiveInteger(set.count),
              reps: asString(set.reps),
              notes: asString(set.notes),
              sourceText: asString(set.sourceText),
            }))
            .filter((set) => set.type !== "unknown");

          return {
            name: asString(exercise.name) ?? "",
            rawPrescription: asString(exercise.rawPrescription),
            sets,
            notes: asString(exercise.notes),
            sourceText: asString(exercise.sourceText),
            confidence: asConfidence(exercise.confidence),
          };
        })
        .filter((exercise) => exercise.name.length > 0 && exercise.sets.length > 0);

      return {
        code,
        label: asString(group.label) ?? `Treino ${code}`,
        exercises,
        sourceText: asString(group.sourceText),
        confidence: asConfidence(group.confidence),
      };
    })
    .filter((group) => /^[A-G]$/.test(group.code) && group.exercises.length > 0);

  if (groups.length === 0) return null;

  return {
    split: normalizeTrainingSplit(v.split) ?? groups.map((group) => group.code).join(""),
    groups,
    guidance: asStringArray(v.guidance),
    glossary: isRecord(v.glossary)
      ? Object.fromEntries(
          Object.entries(v.glossary)
            .map(([key, value]) => [key, asString(value)])
            .filter((entry): entry is [string, string] => entry[1] !== null),
        )
      : {},
    sourceText: asString(v.sourceText),
    confidence: asConfidence(v.confidence),
  };
}

/** Linhas de metadado que jamais podem virar item de refeição. */
const METADATA_ITEM_PATTERN =
  /^(?:treino|divis[aã]o)\b|^fecha(?:mento|r)\b|\bfechamento do dia\b/i;

/**
 * Valida/sanitiza o JSON da IA. Campos ausentes ou inválidos viram
 * null/vazio — nunca valores inventados. Retorna null se a estrutura
 * básica não for um objeto utilizável.
 */
export function validateAiParsedPlan(raw: unknown): AiParsedPlan | null {
  if (!isRecord(raw)) return null;

  const unmapped: AiUnmappedLine[] = asArray(raw.unmapped)
    .filter(isRecord)
    .map((u) => ({ text: asString(u.text) ?? "", reason: asString(u.reason) }))
    .filter((u) => u.text.length > 0);

  const mealPeriods: AiMealPeriod[] = asArray(raw.mealPeriods)
    .filter(isRecord)
    .map((p) => {
      const items: AiMealItem[] = asArray(p.items)
        .filter(isRecord)
        .map((i) => ({
          title: asString(i.title) ?? "",
          quantity: asString(i.quantity),
          unit: asString(i.unit),
          required: i.required !== false,
          sourceText: asString(i.sourceText),
          confidence: asConfidence(i.confidence),
        }))
        .filter((i) => i.title.length > 0);

      // Defesa extra: treino/fechamento classificados como comida → unmapped.
      const safeItems = items.filter((i) => {
        if (METADATA_ITEM_PATTERN.test(i.title)) {
          unmapped.push({
            text: i.sourceText ?? i.title,
            reason: "Metadado do plano classificado fora de refeição",
          });
          return false;
        }
        return true;
      });

      return {
        name: asString(p.name) ?? "",
        timeWindow: asString(p.timeWindow),
        items: safeItems,
        sourceText: asString(p.sourceText),
        confidence: asConfidence(p.confidence),
      };
    })
    .filter((p) => p.name.length > 0);

  const trainingDays: AiTrainingDay[] = asArray(raw.trainingDays)
    .filter(isRecord)
    .map((d) => ({
      weekday: asString(d.weekday),
      label: asString(d.label),
      muscleGroups: asArray(d.muscleGroups)
        .map((g) => asString(g))
        .filter((g): g is string => g !== null),
      sourceText: asString(d.sourceText),
      confidence: asConfidence(d.confidence),
    }))
    .filter((d) => d.weekday !== null || d.label !== null || d.muscleGroups.length > 0);

  const supplements: AiSupplement[] = asArray(raw.supplements)
    .filter(isRecord)
    .map((s) => ({
      title: asString(s.title) ?? "",
      dosage: asString(s.dosage),
      timing: asString(s.timing),
      sourceText: asString(s.sourceText),
      confidence: asConfidence(s.confidence),
    }))
    .filter((s) => s.title.length > 0);

  const sensitiveItems: AiSensitiveItem[] = asArray(raw.sensitiveItems)
    .filter(isRecord)
    .map((s) => ({
      text: asString(s.text) ?? "",
      category: SENSITIVE_CATEGORIES.includes(s.category as AiSensitiveCategory)
        ? (s.category as AiSensitiveCategory)
        : "outro sensível",
      sourceText: asString(s.sourceText),
    }))
    .filter((s) => s.text.length > 0);

  const observations = asArray(raw.observations)
    .filter(isRecord)
    .map((o) => ({
      text: asString(o.text) ?? "",
      sourceText: asString(o.sourceText),
      confidence: asConfidence(o.confidence),
    }))
    .filter((o) => o.text.length > 0);

  const freeMealRaw = isRecord(raw.freeMeal) ? raw.freeMeal : null;
  const checkInRaw = isRecord(raw.checkInInstructions) ? raw.checkInInstructions : null;

  return {
    source:
      raw.source === "paste_ai" || raw.source === "paste_parser"
        ? raw.source
        : "pdf_ai",
    title: asString(raw.title),
    summary: asString(raw.summary),
    confidence: asConfidence(raw.confidence),
    waterTargetMl: normalizeWaterMl(raw.waterTargetMl),
    cardioTargetMin: normalizeCardioMin(raw.cardioTargetMin),
    cardioTargetType:
      raw.cardioTargetType === "daily" || raw.cardioTargetType === "weekly"
        ? raw.cardioTargetType
        : null,
    closeoutTime: normalizeCloseoutTime(raw.closeoutTime),
    trainingSplit: normalizeTrainingSplit(raw.trainingSplit),
    trainingDays,
    mealPeriods,
    supplements,
    freeMeal: freeMealRaw
      ? {
          enabled: freeMealRaw.enabled === true,
          frequency: asString(freeMealRaw.frequency),
          preferredDay: asString(freeMealRaw.preferredDay),
          sourceText: asString(freeMealRaw.sourceText),
          confidence: asConfidence(freeMealRaw.confidence),
        }
      : null,
    checkInInstructions: checkInRaw
      ? {
          frequency: asString(checkInRaw.frequency),
          preferredDay: asString(checkInRaw.preferredDay),
          sourceText: asString(checkInRaw.sourceText),
          confidence: asConfidence(checkInRaw.confidence),
        }
      : null,
    observations,
    sensitiveItems,
    unmapped,
    rawTextPreview: asString(raw.rawTextPreview),
    trainingPlan: asTrainingPlan(raw.trainingPlan),
    coachTips: asStringArray(raw.coachTips),
    nutritionGuidance: asStringArray(raw.nutritionGuidance),
  };
}

// ─── Conversão para o Plano executável do app ────────────────────────────────

const SUPPLEMENT_HINTS =
  /\b(whey|creatina|cafe[ií]na|[oô]mega|multivitam|glutamina|bcaa|beta[- ]?alanina|vitamina|zma|magn[eé]sio|melatonina|termog|pre[- ]?workout|psyllium|ioimbina|carnitina|albumina|caseina|case[ií]na|hmb|arginina|citrulina|taurina|eletr[oó]lito)\b/i;

function detectCategoria(nome: string): Categoria {
  return SUPPLEMENT_HINTS.test(nome) ? "suplemento" : "refeicao";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export type AiPlanConversion = {
  plano: Plano;
  warnings: string[];
  treinoSplit?: string;
  closeoutTime?: string;
  treinos?: Treino[];
};

function trainingSetToSerie(set: AiTrainingSet): Serie | null {
  if (set.type === "unknown") return null;
  return {
    tipo: set.type,
    series: set.count,
    reps: set.reps ?? undefined,
    observacao: set.notes ?? undefined,
  };
}

export function aiTrainingPlanToTreinos(trainingPlan: AiTrainingPlan | null): Treino[] {
  if (!trainingPlan) return [];

  return trainingPlan.groups.map((group) => ({
    id: `treino-${group.code.toLowerCase()}`,
    letra: group.code,
    grupoMuscular: group.label,
    exercicios: group.exercises.map((exercise, index) => ({
      id: `${group.code.toLowerCase()}${index + 1}`,
      nome: exercise.name,
      observacao: exercise.notes ?? undefined,
      series: exercise.sets
        .map(trainingSetToSerie)
        .filter((serie): serie is Serie => serie !== null),
    })),
  }));
}

/**
 * Converte o resultado validado da IA no Plano do app.
 * Itens sensíveis NÃO entram no plano/checklist. Metadados (água, cardio,
 * treino, fechamento) nunca viram itens de refeição.
 */
export function aiPlanToPlano(parsed: AiParsedPlan, planName?: string): AiPlanConversion {
  const warnings: string[] = [];
  const usedIds = new Set<string>();

  function uniqueId(base: string, fallback: string): string {
    let id = slugify(base) || fallback;
    let n = 2;
    while (usedIds.has(id)) id = `${slugify(base) || fallback}-${n++}`;
    usedIds.add(id);
    return id;
  }

  const periodos: Periodo[] = parsed.mealPeriods
    .map((period, pIndex) => {
      const periodoId = uniqueId(period.name, `periodo-${pIndex + 1}`);
      const itens: ItemDoPlano[] = period.items.map((item, iIndex) => {
        const dosagem =
          [item.quantity, item.unit].filter(Boolean).join(" ").trim() || undefined;
        return {
          id: `${periodoId}-${slugify(item.title) || `item-${iIndex + 1}`}`,
          nome: item.title,
          dosagem,
          categoria: detectCategoria(item.title),
          opcional: item.required === false || undefined,
        };
      });
      const nome = period.timeWindow
        ? `${period.name} ${period.timeWindow}`.trim()
        : period.name;
      return { id: periodoId, nome, itens };
    })
    .filter((p) => p.itens.length > 0);

  if (parsed.supplements.length > 0) {
    const periodoId = uniqueId("Suplementos", "suplementos");
    periodos.push({
      id: periodoId,
      nome: "Suplementos",
      itens: parsed.supplements.map((s, i) => ({
        id: `${periodoId}-${slugify(s.title) || `suplemento-${i + 1}`}`,
        nome: s.timing ? `${s.title} (${s.timing})` : s.title,
        dosagem: s.dosage ?? undefined,
        categoria: "suplemento" as Categoria,
      })),
    });
  }

  if (periodos.length === 0) {
    warnings.push("Nenhuma refeição foi reconhecida no PDF. Revise antes de ativar.");
  }
  if (parsed.waterTargetMl === null) {
    warnings.push("Meta de água não encontrada — usando 3.000 ml.");
  }
  if (parsed.cardioTargetMin === null) {
    warnings.push("Meta de cardio não encontrada — usando 0 min.");
  } else if (parsed.cardioTargetType === null) {
    warnings.push(
      "Não ficou claro se o cardio é diário ou semanal. Confirme na etapa de metas.",
    );
  }
  if (parsed.sensitiveItems.length > 0) {
    warnings.push(
      "Itens sensíveis foram separados e não entram no checklist diário.",
    );
  }
  const treinos = aiTrainingPlanToTreinos(parsed.trainingPlan);

  return {
    plano: {
      nome: planName?.trim() || parsed.title || "Plano do coach",
      descricao: `Importado em ${new Date().toLocaleDateString("pt-BR")}`,
      periodos,
      metaHidratacao: { aguaMl: parsed.waterTargetMl ?? 3000, chaMl: 0 },
      metaCardioMin: parsed.cardioTargetMin ?? 0,
    },
    warnings,
    treinoSplit: parsed.trainingSplit ?? undefined,
    closeoutTime: parsed.closeoutTime ?? undefined,
    treinos: treinos.length > 0 ? treinos : undefined,
  };
}

/**
 * Converte a saída do parser determinístico (fallback offline) para o
 * mesmo modelo de revisão usado pelo fluxo de IA.
 */
export function parserResultToAiPlan(result: ParsedPlanResult): AiParsedPlan {
  return {
    source: "paste_parser",
    title: result.plano.nome,
    summary: null,
    confidence: "média",
    waterTargetMl: result.plano.metaHidratacao.aguaMl,
    cardioTargetMin: result.plano.metaCardioMin || null,
    cardioTargetType: result.plano.metaCardioMin ? "daily" : null,
    closeoutTime: result.closeoutTime ?? null,
    trainingSplit: result.treinoSplit ?? null,
    trainingDays: [],
    mealPeriods: result.plano.periodos.map((p) => ({
      name: p.nome,
      timeWindow: null,
      items: p.itens.map((i) => ({
        title: i.nome,
        quantity: i.dosagem ?? null,
        unit: null,
        required: true,
        sourceText: null,
        confidence: "média" as AiConfidence,
      })),
      sourceText: null,
      confidence: "média" as AiConfidence,
    })),
    supplements: [],
    freeMeal: null,
    checkInInstructions: null,
    observations: [],
    sensitiveItems: [],
    unmapped: [],
    rawTextPreview: null,
    trainingPlan: null,
    coachTips: [],
    nutritionGuidance: [],
  };
}
