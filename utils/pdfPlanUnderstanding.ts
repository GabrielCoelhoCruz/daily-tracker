import type { Serie, Treino } from "@/data/treinos";
import type {
  AiConfidence,
  AiParsedPlan,
  AiSensitiveCategory,
  AiTrainingExercise,
  AiTrainingGroup,
  AiTrainingPlan,
  AiTrainingSet,
} from "@/utils/aiPlanImport";

export type PdfLine = {
  pageNumber: number;
  lineNumber: number;
  text: string;
};

export type PdfPage = {
  pageNumber: number;
  text: string;
  lines: PdfLine[];
};

export type PdfDocument = {
  sourceText: string;
  pages: PdfPage[];
};

export type PdfSectionRole =
  | "boilerplate"
  | "athlete_metadata"
  | "sensitive_protocol"
  | "nutrition_protocol"
  | "meal_period"
  | "nutrition_guidance"
  | "free_meal"
  | "cardio"
  | "hydration"
  | "training_split"
  | "training_group"
  | "training_guidance"
  | "unmapped";

export type PdfSection = {
  role: PdfSectionRole;
  heading: string | null;
  pageStart: number;
  pageEnd: number;
  lines: PdfLine[];
  confidence: AiConfidence;
};

export type PdfUnderstandingResult = {
  document: PdfDocument;
  sections: PdfSection[];
  parsedPlan: AiParsedPlan;
};

const PLAN_MARKER_PATTERN =
  /\b(planejamento|protocolo nutricional|refei[cç][aã]o|rotina\/periodiza[cç][aã]o|treino)\b/i;
const SENSITIVE_PATTERN =
  /\b(horm|enant|testo|master|trem|oxan|stano|anastro|diur|medic|clemb|retatrutida|manipula[cç][aã]o\s+de\s+[aá]gua|s[oó]dio)\b/i;
const TRAINING_SET_PATTERN = /(\d+)x\s*(WS|TS|BS|CS)(?:\s*\(([^)]*)\))?/gi;
const TRAINING_CODE_PATTERN = /^[A-G]$/;
const DOSAGE_PREFIX_PATTERN =
  /^(\d+(?:[.,]\d+)?\s*(?:g|mg|mcg|ml|kg|ui|un|unidades?|caps?|c[aá]psulas?|scoops?|dose|doses))\s+(.+)$/i;

function cleanLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasPlanMarker(text: string): boolean {
  return (
    PLAN_MARKER_PATTERN.test(text) ||
    /\b(planejamento|protocolo nutricional|refeicao|rotina\/periodizacao|treino)\b/i.test(
      foldText(text),
    )
  );
}

function isSensitiveLine(text: string): boolean {
  return /\b(horm\w*|enant\w*|testo\w*|master\w*|trem\w*|oxan\w*|stano\w*|anastro\w*|diur\w*|medic\w*|clemb\w*|retatrutida|manipulacao\s+de\s+agua|sodio)\b/i.test(
    foldText(text),
  );
}

function isHeadingLine(text: string): boolean {
  const folded = foldText(text);
  if (
    /^planejamento\b/.test(folded) ||
    /^protocolo hormonal\b/.test(folded) ||
    /^protocolo nutricional\b/.test(folded) ||
    /^rotina\/periodizacao de treinamento\b/.test(folded) ||
    /^observacoes:?$/.test(folded) ||
    /^intra treino\b/.test(folded) ||
    /^em jejum\b/.test(folded) ||
    /^refeicao\s+\d+/.test(folded)
  ) {
    return true;
  }

  return (
    /^PLANEJAMENTO\b/i.test(text) ||
    /^Protocolo hormonal\b/i.test(text) ||
    /^PROTOCOLO NUTRICIONAL\b/i.test(text) ||
    /^ROTINA\/PERIODIZAÇÃO DE TREINAMENTO\b/i.test(text) ||
    /^Observa[cç][oõ]es:?$/i.test(text) ||
    /^INTRA TREINO\b/i.test(text) ||
    /^Em jejum\b/i.test(text) ||
    /^Refei[cç][aã]o\s+\d+/i.test(text) ||
    /^[A-G]:/.test(text)
  );
}

function isBulletLine(text: string): boolean {
  return /^[-–—•*➔]\s*/.test(text);
}

function shouldAppendLine(previous: string, current: string): boolean {
  if (!previous || isHeadingLine(current) || isBulletLine(current)) return false;
  if (/^[A-G]:/.test(current)) return false;
  if (/^[-–—•*➔]/.test(previous)) return true;
  if (previous.length > 90 && /^[a-zà-ú(]/i.test(current)) return true;
  return false;
}

function buildPageLines(pageText: string, pageNumber: number): PdfLine[] {
  const merged: string[] = [];
  for (const rawLine of pageText.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    if (!line) continue;
    const previous = merged[merged.length - 1] ?? "";
    if (shouldAppendLine(previous, line)) {
      merged[merged.length - 1] = `${previous} ${line}`;
    } else {
      merged.push(line);
    }
  }

  return merged.map((text, index) => ({
    pageNumber,
    lineNumber: index + 1,
    text,
  }));
}

export function buildPdfDocument(rawText: string, pageTexts?: string[]): PdfDocument {
  const sourceText = rawText.trim();
  const pages =
    pageTexts && pageTexts.length > 0
      ? pageTexts
      : sourceText.split(/\n\s*(?:--- PAGE_BREAK ---|\f)\s*\n/i);

  return {
    sourceText,
    pages: pages.map((text, index) => ({
      pageNumber: index + 1,
      text,
      lines: buildPageLines(text, index + 1),
    })),
  };
}

function newSection(role: PdfSectionRole, line: PdfLine): PdfSection {
  return {
    role,
    heading: line.text,
    pageStart: line.pageNumber,
    pageEnd: line.pageNumber,
    lines: [line],
    confidence: "alta",
  };
}

function pushLine(section: PdfSection, line: PdfLine): void {
  section.lines.push(line);
  section.pageEnd = line.pageNumber;
}

function sectionRoleForLine(
  line: string,
  currentRole: PdfSectionRole,
  seenTrainingHeader: boolean,
): PdfSectionRole | null {
  const folded = foldText(line);
  if (/^planejamento\b/.test(folded)) return "athlete_metadata";
  if (/^protocolo hormonal\b/.test(folded)) return "sensitive_protocol";
  if (/^protocolo nutricional\b/.test(folded)) return "nutrition_protocol";
  if (/^rotina\/periodizacao de treinamento\b/.test(folded)) return "training_split";
  if (/^observacoes:?$/.test(folded) && seenTrainingHeader) return "training_guidance";
  if (/^intra treino\b/.test(folded) || /^em jejum\b/.test(folded) || /^refeicao\s+\d+/.test(folded)) {
    return "meal_period";
  }
  if (/^[A-G]:\s*$/i.test(line) && seenTrainingHeader) return "training_group";
  if (/^[A-G]:\s*\S+/i.test(line) && seenTrainingHeader) return "training_split";
  if (/refeicoes?\s+livres?/.test(folded)) return "free_meal";
  if (/\bcardios?\b/.test(folded)) return "cardio";
  if (/\b(agua|hidratacao|ingestao de liquido)\b/.test(folded)) return "hydration";
  if (/^\*/.test(line) && seenTrainingHeader) return "training_guidance";
  if (/^\*/.test(line)) return "nutrition_guidance";

  return null;
}

export function segmentPdfDocument(document: PdfDocument): PdfSection[] {
  const sections: PdfSection[] = [];
  let current: PdfSection | null = null;
  let currentRole: PdfSectionRole = "boilerplate";
  let seenTrainingHeader = false;

  for (const page of document.pages) {
    for (const line of page.lines) {
      let nextRole = sectionRoleForLine(line.text, currentRole, seenTrainingHeader);
      if (!current && !nextRole) {
        nextRole = hasPlanMarker(line.text) ? "unmapped" : "boilerplate";
      }
      if (line.pageNumber === 1 && !hasPlanMarker(line.text) && !current) {
        nextRole = "boilerplate";
      }

      if (nextRole) {
        current = newSection(nextRole, line);
        sections.push(current);
        currentRole = nextRole;
        if (nextRole === "training_split") seenTrainingHeader = true;
        continue;
      }

      if (!current) {
        current = newSection("unmapped", line);
        sections.push(current);
      } else {
        pushLine(current, line);
      }
    }
  }

  return sections.filter((section) => section.lines.length > 0);
}

function stripMarker(text: string): string {
  return text.replace(/^[-–—•*➔]\s*/, "").trim();
}

function compactSource(text: string): string {
  return text.length > 140 ? `${text.slice(0, 137)}...` : text;
}

function splitInlineItems(text: string): string[] {
  return text
    .split(/\s+\+\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseMealHeading(text: string): { name: string; timeWindow: string | null; inline: string | null } {
  if (/^Em jejum\b/i.test(text)) {
    const inline = text.includes(":") ? text.split(":").slice(1).join(":").trim() : null;
    return { name: "Jejum", timeWindow: null, inline };
  }
  if (/^INTRA TREINO\b/i.test(text)) {
    const inline = text.includes(":") ? text.split(":").slice(1).join(":").trim() : null;
    return { name: "Intra Treino", timeWindow: null, inline };
  }

  const match = text.match(/^(Refei[cç][aã]o\s+\d+)(?:\s*\(([^)]+)\))?/i);
  return {
    name: match?.[1] ?? text,
    timeWindow: match?.[2] ?? null,
    inline: null,
  };
}

function parseMealItem(text: string, confidence: AiConfidence = "alta") {
  const clean = stripMarker(text);
  if (!clean || /^Refei[cç][aã]o\s+\d+/i.test(clean)) return null;
  if (isSensitiveLine(clean)) return null;

  const dosage = clean.match(DOSAGE_PREFIX_PATTERN);
  if (dosage) {
    return {
      title: dosage[2].trim(),
      quantity: dosage[1].trim(),
      unit: null,
      required: true,
      sourceText: compactSource(clean),
      confidence,
    };
  }

  return {
    title: clean,
    quantity: null,
    unit: null,
    required: true,
    sourceText: compactSource(clean),
    confidence,
  };
}

function sensitiveCategoryFor(text: string): AiSensitiveCategory {
  if (/diur/i.test(text)) return "diurético";
  if (/horm|enant|testo|master|trem|oxan|stano|anastro|retatrutida/i.test(text)) {
    return "hormonal";
  }
  if (/água|agua|sódio|sodio/i.test(text)) return "manipulação de água/sódio";
  if (/medic|clemb/i.test(text)) return "medicamento";
  return "outro sensível";
}

function parseWaterTarget(lines: string[]): number | null {
  for (const line of lines) {
    const match = line.match(/(?:[aá]gua|hidrata[cç][aã]o|l[ií]quido).*?(\d+(?:[.,]\d+)?)\s*(l|litros?|ml)\b/i);
    if (!match) continue;
    const value = Number(match[1].replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) continue;
    return /^l/i.test(match[2]) ? Math.round(value * 1000) : Math.round(value);
  }
  return null;
}

function parseCardioTarget(lines: string[]): { minutes: number | null; type: "daily" | "weekly" | null } {
  for (const line of lines) {
    const match = line.match(/cardio\D*(\d+)\s*(?:min|minutos?)\b/i);
    if (!match) continue;
    return {
      minutes: Number(match[1]),
      type: /semana|semanal/i.test(line) ? "weekly" : "daily",
    };
  }
  return { minutes: null, type: null };
}

function parseTrainingSetNote(raw: string | undefined): { reps: string | null; notes: string | null } {
  if (!raw) return { reps: null, notes: null };
  const [reps, notes] = raw.split("/", 2).map((part) => part.trim());
  return {
    reps: reps || null,
    notes: notes || null,
  };
}

function parseTrainingExercise(line: string): AiTrainingExercise | null {
  const clean = stripMarker(line);
  const matches = Array.from(clean.matchAll(TRAINING_SET_PATTERN));
  if (matches.length === 0) return null;

  const firstMatch = matches[0];
  const name = clean.slice(0, firstMatch.index).trim();
  if (!name) return null;

  const sets: AiTrainingSet[] = matches.map((match) => {
    const parsedNote = parseTrainingSetNote(match[3]);
    return {
      type: match[2] as AiTrainingSet["type"],
      count: Number(match[1]),
      reps: parsedNote.reps,
      notes: parsedNote.notes,
      sourceText: match[0],
    };
  });

  const noteMatch = name.match(/\(([^)]*(?:seg|pico|contra[cç][aã]o|pausa)[^)]*)\)/i);
  return {
    name,
    rawPrescription: clean.slice(firstMatch.index).trim(),
    sets,
    notes: noteMatch?.[1] ?? null,
    sourceText: compactSource(clean),
    confidence: "alta",
  };
}

function parseTrainingPlan(sections: PdfSection[]): AiTrainingPlan | null {
  const splitLines = sections
    .filter((section) => section.role === "training_split")
    .flatMap((section) => section.lines.map((line) => line.text));
  const splitMap = new Map<string, string>();

  for (const line of splitLines) {
    const match = line.match(/^([A-G]):\s*(.+)$/i);
    if (match) {
      splitMap.set(match[1].toUpperCase(), match[2].trim());
    }
  }

  const groups: AiTrainingGroup[] = [];
  for (const section of sections.filter((item) => item.role === "training_group")) {
    const code = section.heading?.replace(":", "").trim().toUpperCase() ?? "";
    if (!TRAINING_CODE_PATTERN.test(code)) continue;
    const exercises = section.lines
      .slice(1)
      .map((line) => parseTrainingExercise(line.text))
      .filter((exercise): exercise is AiTrainingExercise => exercise !== null);
    if (exercises.length === 0) continue;

    groups.push({
      code,
      label: splitMap.get(code) ?? `Treino ${code}`,
      exercises,
      sourceText: compactSource(section.lines.map((line) => line.text).join(" ")),
      confidence: "alta",
    });
  }

  if (groups.length === 0) return null;

  const guidance = sections
    .filter((section) => section.role === "training_guidance")
    .flatMap((section) => section.lines.map((line) => stripMarker(line.text)))
    .filter((line) => line.length > 0);

  return {
    split: groups.map((group) => group.code).join(""),
    groups,
    guidance,
    glossary: {},
    sourceText: compactSource(splitLines.join(" ")),
    confidence: "alta",
  };
}

export function trainingPlanToTreinos(trainingPlan: AiTrainingPlan | null): Treino[] {
  if (!trainingPlan || trainingPlan.groups.length === 0) return [];

  const toSerie = (set: AiTrainingSet): Serie | null => {
    if (set.type === "unknown") return null;
    return {
      tipo: set.type,
      series: set.count,
      reps: set.reps ?? undefined,
      observacao: set.notes ?? undefined,
    };
  };

  return trainingPlan.groups.map((group) => ({
    id: `treino-${group.code.toLowerCase()}`,
    letra: group.code,
    grupoMuscular: group.label,
    exercicios: group.exercises.map((exercise, index) => ({
      id: `${group.code.toLowerCase()}${index + 1}`,
      nome: exercise.name,
      observacao: exercise.notes ?? undefined,
      series: exercise.sets
        .map(toSerie)
        .filter((serie): serie is Serie => serie !== null),
    })),
  }));
}

export function understandPdfPlan(rawText: string, pageTexts?: string[]): PdfUnderstandingResult {
  const document = buildPdfDocument(rawText, pageTexts);
  const sections = segmentPdfDocument(document);
  const allLines = sections.flatMap((section) => section.lines.map((line) => line.text));

  const protocolSensitiveItems = sections
    .filter((section) => section.role === "sensitive_protocol")
    .flatMap((section) => section.lines.slice(1))
    .map((line) => stripMarker(line.text))
    .filter((line) => isSensitiveLine(line))
    .map((text) => ({
      text,
      category: sensitiveCategoryFor(text),
      sourceText: compactSource(text),
    }));

  const mealSensitiveItems = sections
    .filter((section) => section.role === "meal_period")
    .flatMap((section) => section.lines.slice(1))
    .map((line) => stripMarker(line.text))
    .filter((text) => isSensitiveLine(text))
    .filter((text) => !protocolSensitiveItems.some((existing) => existing.text === text))
    .map((text) => ({
      text,
      category: sensitiveCategoryFor(text),
      sourceText: compactSource(text),
    }));

  const sensitiveItems = [...protocolSensitiveItems, ...mealSensitiveItems];

  const mealPeriods = sections
    .filter((section) => section.role === "meal_period")
    .map((section) => {
      const heading = parseMealHeading(section.lines[0].text);
      const inlineItems = heading.inline ? splitInlineItems(heading.inline) : [];
      const bodyItems = section.lines
        .slice(1)
        .map((line) => line.text)
        .filter((line) => /^[-–—•*➔]/.test(line) || DOSAGE_PREFIX_PATTERN.test(stripMarker(line)));
      const items = [...inlineItems, ...bodyItems]
        .flatMap((line) => splitInlineItems(stripMarker(line)))
        .map((line) => parseMealItem(line))
        .filter((item): item is NonNullable<ReturnType<typeof parseMealItem>> => item !== null);

      return {
        name: heading.name,
        timeWindow: heading.timeWindow,
        items,
        sourceText: compactSource(section.lines.map((line) => line.text).join(" ")),
        confidence: "alta" as AiConfidence,
      };
    })
    .filter((period) => period.items.length > 0);

  const nutritionGuidance = sections
    .filter((section) => section.role === "nutrition_guidance" || section.role === "hydration")
    .flatMap((section) => section.lines.map((line) => stripMarker(line.text)))
    .filter((line) => line.length > 0);

  const coachTips = sections
    .filter((section) => section.role === "free_meal" || section.role === "cardio")
    .flatMap((section) => section.lines.map((line) => stripMarker(line.text)))
    .filter((line) => line.length > 0);

  const cardio = parseCardioTarget(allLines);
  const trainingPlan = parseTrainingPlan(sections);
  const title = allLines.find((line) => /^PLANEJAMENTO\b/i.test(line)) ?? null;

  return {
    document,
    sections,
    parsedPlan: {
      source: "paste_parser",
      title,
      summary: null,
      confidence: "média",
      waterTargetMl: parseWaterTarget(allLines),
      cardioTargetMin: cardio.minutes,
      cardioTargetType: cardio.type,
      closeoutTime: null,
      trainingSplit: trainingPlan?.split ?? null,
      trainingDays: trainingPlan
        ? trainingPlan.groups.map((group) => ({
            weekday: null,
            label: `Treino ${group.code}`,
            muscleGroups: [group.label],
            sourceText: group.sourceText,
            confidence: group.confidence,
          }))
        : [],
      mealPeriods,
      supplements: [],
      freeMeal: coachTips.some((tip) => /refei[cç][oõ]es?\s+livres?/i.test(tip))
        ? {
            enabled: true,
            frequency: "1x/semana",
            preferredDay: null,
            sourceText: coachTips.find((tip) => /refei[cç][oõ]es?\s+livres?/i.test(tip)) ?? null,
            confidence: "média",
          }
        : null,
      checkInInstructions: null,
      observations: nutritionGuidance.map((text) => ({
        text,
        sourceText: compactSource(text),
        confidence: "média",
      })),
      sensitiveItems,
      unmapped: sections
        .filter((section) => section.role === "unmapped")
        .flatMap((section) =>
          section.lines.map((line) => ({ text: line.text, reason: "Seção não classificada" })),
        ),
      rawTextPreview: rawText.slice(0, 400),
      trainingPlan,
      coachTips,
      nutritionGuidance,
    },
  };
}

export function formatSectionsForAi(sections: PdfSection[]): string {
  return sections
    .filter((section) => section.role !== "boilerplate")
    .map((section) => {
      const lines = section.lines.map((line) => line.text).join("\n");
      return `[${section.role.toUpperCase()} p.${section.pageStart}-${section.pageEnd}]\n${lines}`;
    })
    .join("\n\n");
}
