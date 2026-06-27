import type { PhysiqueCheckIn, TargetCategory } from "@/stores/usePhysiqueStore";
import { CATEGORY_LABELS, MODE_LABELS } from "@/stores/usePhysiqueStore";
import {
  STAGE_READINESS_LABELS,
  STAGE_READINESS_ORDER,
  type StageReadinessLevel,
} from "@/constants/stageReadiness";

export type StageReadinessTone = "empty" | "far" | "progressing" | "close" | "ready";

export type PhysiqueIntelligenceSummary = {
  hasCheckIns: boolean;
  latestCheckIn: PhysiqueCheckIn | null;
  checkInCount: number;
  latestWeightKg: number | null;
  weightDeltaKg: number | null;
  stageReadinessLabel: string | null;
  stageReadinessTone: StageReadinessTone;
  overallConditioning: number | null;
  vTaper: number | null;
  targetCategoryLabel: string | null;
};

export type StageReadinessTrend = {
  direction: "improving" | "declining" | "stable" | "unknown";
  previousLabel: string | null;
  currentLabel: string | null;
};

export type WeightTrendSummary = {
  latestWeightKg: number | null;
  deltaKg: number | null;
  direction: "up" | "down" | "stable" | "unknown";
};

export type AISignal = {
  title: string;
  message: string;
  hasAnalysis: boolean;
};

export type PhysiqueAction =
  | {
      type: "complete-profile";
      title: string;
      subtitle: string;
      route: "./profile";
    }
  | {
      type: "new-checkin";
      title: string;
      subtitle: string;
      route: "./new-checkin";
    }
  | {
      type: "compare";
      title: string;
      subtitle: string;
      route: "./compare";
    }
  | {
      type: "view-latest";
      title: string;
      subtitle: string;
      checkInId: string;
    };

export type CheckInTimelineItem = {
  id: string;
  week: number;
  date: string;
  weightKg: number;
  weightDeltaKg: number | null;
  modeLabel: string;
  stageReadinessLabel: string | null;
  hasAnalysis: boolean;
  thumbnailUri: string | null;
};

export type AthleteProfileContext = {
  lastCategory?: TargetCategory;
};

function compareCheckInsNewestFirst(a: PhysiqueCheckIn, b: PhysiqueCheckIn): number {
  if (b.week !== a.week) return b.week - a.week;
  return b.date.localeCompare(a.date);
}

function getScoredCheckIns(checkIns: PhysiqueCheckIn[]): PhysiqueCheckIn[] {
  return checkIns
    .filter(
      (c) =>
        c.scores?.stageReadiness &&
        STAGE_READINESS_ORDER.includes(c.scores.stageReadiness as StageReadinessLevel)
    )
    .sort(compareCheckInsNewestFirst);
}

function getStageReadinessLabel(level: string | undefined): string | null {
  if (!level) return null;
  if (STAGE_READINESS_ORDER.includes(level as StageReadinessLevel)) {
    return STAGE_READINESS_LABELS[level as StageReadinessLevel];
  }
  return null;
}

function getStageReadinessTone(level: string | undefined): StageReadinessTone {
  if (!level) return "empty";
  switch (level) {
    case "longe":
      return "far";
    case "progredindo":
      return "progressing";
    case "se_aproximando":
    case "quase_pronto":
      return "close";
    case "stage_ready":
      return "ready";
    default:
      return "empty";
  }
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getLatestCheckIn(
  checkIns: PhysiqueCheckIn[]
): PhysiqueCheckIn | null {
  if (checkIns.length === 0) return null;
  return [...checkIns].sort(compareCheckInsNewestFirst)[0];
}

export function getPhysiqueIntelligenceSummary(
  checkIns: PhysiqueCheckIn[],
  athleteProfile: AthleteProfileContext = {}
): PhysiqueIntelligenceSummary {
  const latest = getLatestCheckIn(checkIns);

  if (!latest) {
    return {
      hasCheckIns: false,
      latestCheckIn: null,
      checkInCount: 0,
      latestWeightKg: null,
      weightDeltaKg: null,
      stageReadinessLabel: null,
      stageReadinessTone: "empty",
      overallConditioning: null,
      vTaper: null,
      targetCategoryLabel: null,
    };
  }

  const weightDeltaKg =
    latest.previousWeight != null
      ? roundToOneDecimal(latest.weight - latest.previousWeight)
      : null;

  const targetCategory =
    latest.targetCategory ?? athleteProfile.lastCategory ?? undefined;
  const targetCategoryLabel =
    targetCategory && targetCategory !== "undecided"
      ? CATEGORY_LABELS[targetCategory]
      : targetCategory === "undecided"
        ? CATEGORY_LABELS.undecided
        : null;

  const stageLevel = latest.scores?.stageReadiness;

  return {
    hasCheckIns: true,
    latestCheckIn: latest,
    checkInCount: checkIns.length,
    latestWeightKg: latest.weight,
    weightDeltaKg,
    stageReadinessLabel: getStageReadinessLabel(stageLevel),
    stageReadinessTone: getStageReadinessTone(stageLevel),
    overallConditioning: latest.scores?.overallConditioning ?? null,
    vTaper: latest.scores?.vTaper ?? null,
    targetCategoryLabel,
  };
}

export function getStageReadinessTrend(
  checkIns: PhysiqueCheckIn[]
): StageReadinessTrend {
  const scored = getScoredCheckIns(checkIns);

  if (scored.length < 2) {
    return {
      direction: "unknown",
      previousLabel: null,
      currentLabel: scored[0]
        ? getStageReadinessLabel(scored[0].scores?.stageReadiness)
        : null,
    };
  }

  const current = scored[0];
  const previous = scored[1];
  const currentLevel = current.scores!.stageReadiness as StageReadinessLevel;
  const previousLevel = previous.scores!.stageReadiness as StageReadinessLevel;
  const currentIndex = STAGE_READINESS_ORDER.indexOf(currentLevel);
  const previousIndex = STAGE_READINESS_ORDER.indexOf(previousLevel);

  let direction: StageReadinessTrend["direction"] = "stable";
  if (currentIndex > previousIndex) direction = "improving";
  else if (currentIndex < previousIndex) direction = "declining";

  return {
    direction,
    previousLabel: getStageReadinessLabel(previousLevel),
    currentLabel: getStageReadinessLabel(currentLevel),
  };
}

export function getWeightTrendSummary(
  checkIns: PhysiqueCheckIn[]
): WeightTrendSummary {
  const latest = getLatestCheckIn(checkIns);
  if (!latest) {
    return {
      latestWeightKg: null,
      deltaKg: null,
      direction: "unknown",
    };
  }

  let deltaKg: number | null = null;

  if (latest.previousWeight != null) {
    deltaKg = roundToOneDecimal(latest.weight - latest.previousWeight);
  } else {
    const sorted = [...checkIns].sort(compareCheckInsNewestFirst);
    if (sorted.length >= 2) {
      deltaKg = roundToOneDecimal(sorted[0].weight - sorted[1].weight);
    }
  }

  if (deltaKg == null) {
    return {
      latestWeightKg: latest.weight,
      deltaKg: null,
      direction: "unknown",
    };
  }

  let direction: WeightTrendSummary["direction"] = "stable";
  if (deltaKg > 0) direction = "up";
  else if (deltaKg < 0) direction = "down";

  return {
    latestWeightKg: latest.weight,
    deltaKg,
    direction,
  };
}

function stripMarkdownHeadings(line: string): string {
  return line.replace(/^#{1,6}\s*/, "").trim();
}

function extractAnalysisPreview(analysis: string): string {
  const lines = analysis
    .split("\n")
    .map((line) => stripMarkdownHeadings(line.trim()))
    .filter((line) => line.length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rawLine = analysis.split("\n").find((l) => l.includes(line)) ?? "";
    const wasHeading = /^#{1,6}\s/.test(rawLine.trim());

    if (wasHeading && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.startsWith("```")) {
        return nextLine.length > 180 ? `${nextLine.slice(0, 180).trim()}…` : nextLine;
      }
    }

    if (!wasHeading && line.length > 0 && !line.startsWith("```")) {
      return line.length > 180 ? `${line.slice(0, 180).trim()}…` : line;
    }
  }

  const flat = lines.join(" ");
  if (flat.length === 0) return "";
  return flat.length > 180 ? `${flat.slice(0, 180).trim()}…` : flat;
}

export function getLatestAISignal(checkIn: PhysiqueCheckIn | null): AISignal {
  if (!checkIn) {
    return {
      title: "Latest AI Signal",
      message: "Create your first check-in to unlock AI physique insights.",
      hasAnalysis: false,
    };
  }

  if (!checkIn.analysis?.trim()) {
    return {
      title: "Latest AI Signal",
      message: "Open the latest check-in to generate or view analysis.",
      hasAnalysis: false,
    };
  }

  const preview = extractAnalysisPreview(checkIn.analysis);
  return {
    title: "Latest AI Signal",
    message: preview || "Analysis available — open the latest check-in for details.",
    hasAnalysis: true,
  };
}

export function getNextPhysiqueAction(
  checkIns: PhysiqueCheckIn[],
  isProfileComplete: boolean,
  latestCheckIn: PhysiqueCheckIn | null = getLatestCheckIn(checkIns)
): PhysiqueAction {
  if (!isProfileComplete) {
    return {
      type: "complete-profile",
      title: "Complete your athlete profile",
      subtitle: "Unlock category matching and AI analysis context.",
      route: "./profile",
    };
  }

  if (checkIns.length === 0) {
    return {
      type: "new-checkin",
      title: "Create your first check-in",
      subtitle: "Start tracking stage readiness and physique trends.",
      route: "./new-checkin",
    };
  }

  if (checkIns.length === 1) {
    return {
      type: "new-checkin",
      title: "Add a second check-in",
      subtitle: "Comparison needs at least two check-ins.",
      route: "./new-checkin",
    };
  }

  return {
    type: "compare",
    title: "Compare check-ins",
    subtitle: "Track visual and score changes side by side.",
    route: "./compare",
  };
}

export function getCheckInTimelineItems(
  checkIns: PhysiqueCheckIn[]
): CheckInTimelineItem[] {
  return [...checkIns]
    .sort(compareCheckInsNewestFirst)
    .map((checkIn) => {
      const weightDeltaKg =
        checkIn.previousWeight != null
          ? roundToOneDecimal(checkIn.weight - checkIn.previousWeight)
          : null;

      return {
        id: checkIn.id,
        week: checkIn.week,
        date: checkIn.date,
        weightKg: checkIn.weight,
        weightDeltaKg,
        modeLabel: MODE_LABELS[checkIn.mode] ?? checkIn.mode,
        stageReadinessLabel: getStageReadinessLabel(
          checkIn.scores?.stageReadiness
        ),
        hasAnalysis: Boolean(checkIn.analysis?.trim()),
        thumbnailUri: checkIn.photoPaths[0] ?? null,
      };
    });
}

export function getStageReadinessTrendLabel(
  trend: StageReadinessTrend
): string {
  switch (trend.direction) {
    case "improving":
      return "Improving";
    case "declining":
      return "Declining";
    case "stable":
      return "Stable";
    default:
      return "—";
  }
}
