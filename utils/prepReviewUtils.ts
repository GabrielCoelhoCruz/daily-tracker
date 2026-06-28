import type { HistoricoDia } from "@/stores/useHistoryStore";

export type ExecutionTone =
  | "complete"
  | "strong"
  | "warning"
  | "leak"
  | "empty";

export type WeeklyExecutionReview = {
  averageScore: number | null;
  closedDays: number;
  totalDays: number;
  daysWithLeaks: number;
  bestDay: { date: string; score: number } | null;
  mainLeak: {
    type: string;
    title: string;
    count: number;
    evidence: string;
  } | null;
};

export type DayLeakSummary = {
  executionScore: number | null;
  primaryLeak: string | null;
  evidenceShort: string | null;
  hasCloseout: boolean;
  tone: ExecutionTone;
};

export type CalendarDayExecutionState = {
  tone: ExecutionTone;
  executionScore: number | null;
  hasCloseout: boolean;
  hasLeaks: boolean;
};

export type PrepReviewSummary = {
  weeklyAdherence: number | null;
  monthlyAdherence: number | null;
  loggedDaysThisWeek: number;
  strongDaysThisWeek: number;
  weakDaysThisWeek: number;
  perfectDaysThisWeek: number;
  streak: number;
};

export type MissedPattern = {
  name: string;
  missedCount: number;
  loggedDayPercentage: number;
};

export type PrepInsight = {
  tone: "good" | "warning" | "neutral";
  title: string;
  message: string;
};

export type RecentDaySummary = {
  date: string;
  label: string;
  completed: number;
  total: number;
  percentage: number | null;
  tone: ExecutionTone | "perfect" | "strong" | "partial" | "weak";
  inProgress: boolean;
  executionScore: number | null;
  primaryLeak: string | null;
  evidenceShort: string | null;
  hasCloseout: boolean;
};

export type CalendarDayTone =
  | "future"
  | "today"
  | "no-data"
  | "perfect"
  | "strong"
  | "partial"
  | "weak";

export type BestWeakestResult = {
  bestDay: { date: string; percentage: number } | null;
  weakestDay: { date: string; percentage: number } | null;
  averageAdherence: number | null;
};

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const LEAK_TYPE_LABELS: Record<string, string> = {
  meal: "Refeição incompleta",
  cardio: "Cardio incompleto",
  hydration: "Hidratação abaixo do alvo",
  training: "Treino parcial",
};

function classifyLeakTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("refei")) return "meal";
  if (lower.includes("cardio")) return "cardio";
  if (lower.includes("hidrata") || lower.includes("água")) return "hydration";
  if (lower.includes("treino") || lower.includes("sets")) return "training";
  return "other";
}

export function getExecutionScoreTone(
  score: number | null | undefined,
): ExecutionTone {
  if (score == null) return "empty";
  if (score >= 90) return "complete";
  if (score >= 75) return "strong";
  if (score >= 50) return "warning";
  return "leak";
}

function legacyAdherenceToTone(entry: HistoricoDia): ExecutionTone {
  if (entry.total === 0) return "empty";
  const pct = Math.round((entry.completados / entry.total) * 100);
  return getExecutionScoreTone(pct);
}

export function getDayLeakSummary(entry: HistoricoDia): DayLeakSummary {
  const hasCloseout = Boolean(entry.closeoutSavedAt);
  const executionScore = entry.executionScore ?? null;
  const primaryLeak = entry.closeoutLeaks?.[0] ?? null;

  if (hasCloseout) {
    return {
      executionScore,
      primaryLeak,
      evidenceShort: entry.closeoutEvidence ?? null,
      hasCloseout: true,
      tone: getExecutionScoreTone(executionScore),
    };
  }

  return {
    executionScore: null,
    primaryLeak: entry.itensPerdidos[0] ?? null,
    evidenceShort:
      entry.total > 0
        ? `${entry.completados}/${entry.total} itens`
        : null,
    hasCloseout: false,
    tone: legacyAdherenceToTone(entry),
  };
}

function getWeekDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const cursor = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");

  while (cursor <= endDate) {
    days.push(dateToStr(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function getWeeklyExecutionReview(
  dias: Record<string, HistoricoDia>,
  referenceDate: string,
): WeeklyExecutionReview {
  const weekBounds = getWeekBoundsForDate(referenceDate);
  const weekDays = getWeekDaysInRange(weekBounds.start, weekBounds.end);

  let scoreSum = 0;
  let scoredDays = 0;
  let closedDays = 0;
  let daysWithLeaks = 0;
  let bestDay: { date: string; score: number } | null = null;

  for (const dateStr of weekDays) {
    const entry = dias[dateStr];
    if (!entry?.closeoutSavedAt) continue;

    closedDays++;

    if (entry.executionScore != null) {
      scoreSum += entry.executionScore;
      scoredDays++;

      if (!bestDay || entry.executionScore > bestDay.score) {
        bestDay = { date: dateStr, score: entry.executionScore };
      }
    }

    if (entry.closeoutLeaks && entry.closeoutLeaks.length > 0) {
      daysWithLeaks++;
    }
  }

  return {
    averageScore:
      scoredDays > 0 ? Math.round(scoreSum / scoredDays) : null,
    closedDays,
    totalDays: weekDays.length,
    daysWithLeaks,
    bestDay,
    mainLeak: getMainWeeklyLeak(dias, referenceDate),
  };
}

export function getMainWeeklyLeak(
  dias: Record<string, HistoricoDia>,
  referenceDate: string,
): WeeklyExecutionReview["mainLeak"] {
  const weekBounds = getWeekBoundsForDate(referenceDate);
  const leakCounts: Record<string, number> = {};

  for (const [dateStr, entry] of Object.entries(dias)) {
    if (dateStr < weekBounds.start || dateStr > weekBounds.end) continue;
    if (!entry.closeoutSavedAt || !entry.closeoutLeaks?.length) continue;

    for (const leakTitle of entry.closeoutLeaks) {
      const type = classifyLeakTitle(leakTitle);
      leakCounts[type] = (leakCounts[type] || 0) + 1;
    }
  }

  const sorted = Object.entries(leakCounts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top || top[0] === "other") return null;

  const [type, count] = top;
  const label = LEAK_TYPE_LABELS[type] ?? type;

  return {
    type,
    title: `${label} em ${count} ${count === 1 ? "dia" : "dias"}`,
    count,
    evidence: `${count} fechamento${count === 1 ? "" : "s"} registraram ${label.toLowerCase()} nesta semana.`,
  };
}

export function getRecentCloseoutDays(
  dias: Record<string, HistoricoDia>,
  todayDate: string,
  limit = 7,
): RecentDaySummary[] {
  return Object.values(dias)
    .filter((entry) => Boolean(entry.closeoutSavedAt))
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limit)
    .map((entry) => buildRecentDaySummary(entry, todayDate));
}

export function getCalendarDayExecutionState(
  dateStr: string,
  todayDate: string,
  entry: HistoricoDia | null | undefined,
): CalendarDayExecutionState {
  if (!entry?.closeoutSavedAt) {
    return {
      tone: "empty",
      executionScore: null,
      hasCloseout: false,
      hasLeaks: false,
    };
  }

  const executionScore = entry.executionScore ?? null;

  return {
    tone: getExecutionScoreTone(executionScore),
    executionScore,
    hasCloseout: true,
    hasLeaks: Boolean(entry.closeoutLeaks && entry.closeoutLeaks.length > 0),
  };
}

function getWeekBoundsForDate(todayDate: string): { start: string; end: string } {
  const logicalToday = new Date(todayDate + "T12:00:00");
  const day = logicalToday.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(logicalToday);
  monday.setDate(logicalToday.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: dateToStr(monday), end: dateToStr(sunday) };
}

function getMonthPrefix(todayDate: string): string {
  return todayDate.slice(0, 7);
}

function dayAdherence(entry: HistoricoDia): number | null {
  if (entry.total === 0) return null;
  return Math.round((entry.completados / entry.total) * 100);
}

function calcAdherence(
  dias: Record<string, HistoricoDia>,
  filter: (dateStr: string) => boolean
): number | null {
  let totalComp = 0;
  let totalItems = 0;

  for (const [dateStr, entry] of Object.entries(dias)) {
    if (!filter(dateStr)) continue;
    totalComp += entry.completados;
    totalItems += entry.total;
  }

  if (totalItems === 0) return null;
  return Math.round((totalComp / totalItems) * 100);
}

function calcStreak(
  dias: Record<string, HistoricoDia>,
  todayDate: string
): number {
  const logicalToday = new Date(todayDate + "T12:00:00");
  let streak = 0;
  const d = new Date(logicalToday);

  d.setDate(d.getDate() - 1);

  while (true) {
    const dateStr = dateToStr(d);
    const entry = dias[dateStr];
    if (!entry || entry.total === 0 || entry.completados < entry.total) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const todayEntry = dias[todayDate];
  if (
    todayEntry &&
    todayEntry.total > 0 &&
    todayEntry.completados >= todayEntry.total
  ) {
    streak++;
  }

  return streak;
}

export function getPrepReviewSummary(
  dias: Record<string, HistoricoDia>,
  todayDate: string
): PrepReviewSummary {
  const weekBounds = getWeekBoundsForDate(todayDate);
  const monthPrefix = getMonthPrefix(todayDate);

  const weeklyAdherence = calcAdherence(
    dias,
    (d) => d >= weekBounds.start && d <= weekBounds.end
  );
  const monthlyAdherence = calcAdherence(dias, (d) =>
    d.startsWith(monthPrefix)
  );

  let loggedDaysThisWeek = 0;
  let strongDaysThisWeek = 0;
  let weakDaysThisWeek = 0;
  let perfectDaysThisWeek = 0;

  for (const [dateStr, entry] of Object.entries(dias)) {
    if (dateStr < weekBounds.start || dateStr > weekBounds.end) continue;
    loggedDaysThisWeek++;

    const adherence = dayAdherence(entry);
    if (adherence === null) continue;

    if (adherence >= 100) perfectDaysThisWeek++;
    else if (adherence >= 80) strongDaysThisWeek++;
    if (adherence < 60) weakDaysThisWeek++;
  }

  return {
    weeklyAdherence,
    monthlyAdherence,
    loggedDaysThisWeek,
    strongDaysThisWeek,
    weakDaysThisWeek,
    perfectDaysThisWeek,
    streak: calcStreak(dias, todayDate),
  };
}

const MIN_DAYS_FOR_INSIGHT = 3;

export function getTopMissedPatterns(
  dias: Record<string, HistoricoDia>
): MissedPattern[] {
  const missCounts: Record<string, number> = {};
  let totalDays = 0;

  for (const entry of Object.values(dias)) {
    totalDays++;
    for (const item of entry.itensPerdidos) {
      missCounts[item] = (missCounts[item] || 0) + 1;
    }
  }

  if (totalDays === 0) return [];

  return Object.entries(missCounts)
    .map(([name, missedCount]) => ({
      name,
      missedCount,
      loggedDayPercentage: Math.round((missedCount / totalDays) * 100),
    }))
    .sort((a, b) => b.missedCount - a.missedCount);
}

export function getPrimaryPrepInsight(
  dias: Record<string, HistoricoDia>
): PrepInsight {
  const loggedDays = Object.keys(dias).length;

  if (loggedDays < MIN_DAYS_FOR_INSIGHT) {
    return {
      tone: "neutral",
      title: "Continue registrando",
      message:
        "Mais dias completos revelarão seus padrões de preparação.",
    };
  }

  const patterns = getTopMissedPatterns(dias);
  const top = patterns[0];

  if (!top || top.missedCount <= 1) {
    return {
      tone: "good",
      title: "Consistência forte",
      message: "Nenhuma falha repetida nos dias registrados.",
    };
  }

  return {
    tone: "warning",
    title: `Principal falha: ${top.name}`,
    message: `Perdido em ${top.missedCount} de ${loggedDays} dias registrados.`,
  };
}

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDayLabel(dateStr: string, todayDate: string): string {
  if (dateStr === todayDate) return "Hoje";

  const today = new Date(todayDate + "T12:00:00");
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === dateToStr(yesterday)) return "Ontem";

  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES_SHORT[d.getDay()] ?? dateStr;
}

function buildRecentDaySummary(
  entry: HistoricoDia,
  todayDate: string,
): RecentDaySummary {
  const leakSummary = getDayLeakSummary(entry);
  const percentage = dayAdherence(entry);
  const isToday = entry.data === todayDate;
  const inProgress =
    isToday &&
    !entry.closeoutSavedAt &&
    entry.total > 0 &&
    entry.completados < entry.total;

  return {
    date: entry.data,
    label: getDayLabel(entry.data, todayDate),
    completed: entry.completados,
    total: entry.total,
    percentage: leakSummary.hasCloseout
      ? leakSummary.executionScore
      : percentage,
    tone: leakSummary.tone,
    inProgress,
    executionScore: leakSummary.executionScore,
    primaryLeak: leakSummary.primaryLeak,
    evidenceShort: leakSummary.evidenceShort,
    hasCloseout: leakSummary.hasCloseout,
  };
}

export function getRecentDaySummaries(
  dias: Record<string, HistoricoDia>,
  todayDate: string,
  limit = 7,
): RecentDaySummary[] {
  return Object.values(dias)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limit)
    .map((entry) => buildRecentDaySummary(entry, todayDate));
}

function executionToneToCalendarTone(tone: ExecutionTone): CalendarDayTone {
  switch (tone) {
    case "complete":
      return "perfect";
    case "strong":
      return "strong";
    case "warning":
      return "partial";
    case "leak":
      return "weak";
    default:
      return "no-data";
  }
}

export function getCalendarDayTone(
  dateStr: string,
  todayDate: string,
  entry: HistoricoDia | null | undefined,
): CalendarDayTone {
  if (dateStr > todayDate) return "future";
  if (dateStr === todayDate && !entry) return "today";
  if (!entry) return "no-data";

  if (entry.closeoutSavedAt && entry.executionScore != null) {
    return executionToneToCalendarTone(
      getExecutionScoreTone(entry.executionScore),
    );
  }

  if (entry.total === 0) return "no-data";

  const pct = (entry.completados / entry.total) * 100;
  if (pct >= 100) return "perfect";
  if (pct >= 80) return "strong";
  if (pct >= 50) return "partial";
  return "weak";
}

export function getBestAndWeakestDays(
  dias: Record<string, HistoricoDia>
): BestWeakestResult {
  const entries = Object.values(dias).filter((e) => e.total > 0);

  if (entries.length === 0) {
    return { bestDay: null, weakestDay: null, averageAdherence: null };
  }

  let bestDay: { date: string; percentage: number } | null = null;
  let weakestDay: { date: string; percentage: number } | null = null;
  let totalPct = 0;

  for (const entry of entries) {
    const pct = dayAdherence(entry)!;
    totalPct += pct;

    if (!bestDay || pct > bestDay.percentage) {
      bestDay = { date: entry.data, percentage: pct };
    }
    if (!weakestDay || pct < weakestDay.percentage) {
      weakestDay = { date: entry.data, percentage: pct };
    }
  }

  return {
    bestDay,
    weakestDay,
    averageAdherence: Math.round(totalPct / entries.length),
  };
}
