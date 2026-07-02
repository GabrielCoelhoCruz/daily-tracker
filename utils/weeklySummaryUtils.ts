import type { HistoricoDia } from "@/stores/useHistoryStore";
import type { PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import { getMainWeeklyLeak } from "@/utils/prepReviewUtils";

/**
 * Resumo semanal exportável (PT-BR) — "Resumo para coach" ou "Resumo da semana".
 * Usa apenas dados reais registrados; ausências viram "não registrado".
 */

export type WeeklySummaryInput = {
  dias: Record<string, HistoricoDia>;
  checkIns: PhysiqueCheckIn[];
  todayDate: string;
  hasCoach: boolean;
  userNote?: string;
};

const NOT_RECORDED = "não registrado";

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekBounds(todayDate: string): { start: string; end: string } {
  const logicalToday = new Date(todayDate + "T12:00:00");
  const day = logicalToday.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(logicalToday);
  monday.setDate(logicalToday.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: dateToStr(monday), end: dateToStr(sunday) };
}

function getIsoWeekNumber(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00");
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1).replace(".", ",");
}

function daysSince(dateStr: string, todayDate: string): number {
  const a = new Date(dateStr.slice(0, 10) + "T12:00:00").valueOf();
  const b = new Date(todayDate + "T12:00:00").valueOf();
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function buildWeeklySummaryText(input: WeeklySummaryInput): string {
  const { dias, checkIns, todayDate, userNote } = input;
  const bounds = getWeekBounds(todayDate);

  const closedEntries = Object.values(dias)
    .filter(
      (d) =>
        d.data >= bounds.start && d.data <= bounds.end && d.closeoutSavedAt,
    )
    .sort((a, b) => a.data.localeCompare(b.data));

  // Execução geral — média dos scores dos dias fechados
  const scored = closedEntries.filter((d) => d.executionScore != null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, d) => sum + (d.executionScore ?? 0), 0) /
            scored.length,
        )
      : null;

  // Protocolo/refeições — aderência agregada aos itens do checklist
  const totalItems = closedEntries.reduce((s, d) => s + d.total, 0);
  const doneItems = closedEntries.reduce((s, d) => s + d.completados, 0);
  const protocolScore =
    totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : null;

  // Refeições parciais — aderência parcial não é tratada como pulada
  const partialMeals = closedEntries.reduce(
    (s, d) => s + (d.refeicoesParciais ?? 0),
    0,
  );

  // Água — média/dia nos dias fechados com registro
  const waterDays = closedEntries.filter((d) => d.aguaMl != null);
  const waterAvgMl =
    waterDays.length > 0
      ? waterDays.reduce((s, d) => s + (d.aguaMl ?? 0), 0) / waterDays.length
      : null;

  // Cardio — feito vs meta na semana
  const cardioDays = closedEntries.filter((d) => d.cardioMin != null);
  const cardioDone = cardioDays.reduce((s, d) => s + (d.cardioMin ?? 0), 0);
  const cardioTarget = cardioDays.reduce(
    (s, d) => s + (d.metaCardioMin ?? 0),
    0,
  );

  // Treino — sessões concluídas vs agendadas
  const trainingScheduled = closedEntries.filter(
    (d) => d.treinoAgendado,
  ).length;
  const trainingCompleted = closedEntries.filter(
    (d) => d.treinoConcluido,
  ).length;

  const mainLeak = getMainWeeklyLeak(dias, todayDate);

  // Peso e check-in — últimos dois check-ins registrados
  const sortedCheckIns = [...checkIns].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const latest = sortedCheckIns[sortedCheckIns.length - 1];
  const previous = sortedCheckIns[sortedCheckIns.length - 2];

  const weightLine = latest
    ? previous
      ? `${previous.weight}kg → ${latest.weight}kg`
      : `${latest.weight}kg`
    : NOT_RECORDED;

  const freshnessLine = latest
    ? `há ${daysSince(latest.date, todayDate)} dias`
    : NOT_RECORDED;

  const checkInSummary = latest
    ? `Check-in de ${latest.date.slice(0, 10)} com ${latest.photoPaths.length} foto${latest.photoPaths.length === 1 ? "" : "s"}`
    : "Nenhum check-in registrado";

  const lines = [
    `Resumo ShapeIQ — Semana ${getIsoWeekNumber(todayDate)}`,
    "",
    `Execução geral: ${avgScore != null ? `${avgScore}%` : NOT_RECORDED}`,
    `Dias fechados: ${closedEntries.length}/7`,
    "",
    `Protocolo/refeições: ${protocolScore != null ? `${protocolScore}%` : NOT_RECORDED}${partialMeals > 0 ? ` (${partialMeals} ${partialMeals === 1 ? "refeição parcial" : "refeições parciais"})` : ""}`,
    `Água: ${waterAvgMl != null ? `média ${formatLiters(waterAvgMl)}L/dia` : NOT_RECORDED}`,
    `Cardio: ${cardioDays.length > 0 ? `${cardioDone}/${cardioTarget} min na semana` : NOT_RECORDED}`,
    `Treino: ${trainingScheduled > 0 ? `${trainingCompleted}/${trainingScheduled} sessões` : NOT_RECORDED}`,
    "",
    `Principal vazamento: ${mainLeak ? mainLeak.title : closedEntries.length >= 3 ? "Semana sólida. Sem vazamento dominante." : NOT_RECORDED}`,
    "",
    `Peso: ${weightLine}`,
    `Último check-in: ${freshnessLine}`,
    "",
    "Observação:",
    userNote?.trim() || NOT_RECORDED,
    "",
    "Evidência disponível:",
    checkInSummary,
  ];

  return lines.join("\n");
}

export function getSummaryTitle(hasCoach: boolean): string {
  return hasCoach ? "Resumo para coach" : "Resumo da semana";
}
