/**
 * Returns the "logical date" string (YYYY-MM-DD) for a given Date,
 * using 4am as the day boundary. Before 4am counts as the previous day.
 */
export function getLogicalDate(date: Date): string {
  const adjusted = new Date(date);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, "0");
  const d = String(adjusted.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns the day-of-week (0=Sunday..6=Saturday) for the logical date
 * (accounting for the 4am boundary).
 */
export function getLogicalDayOfWeek(date: Date): number {
  const adjusted = new Date(date);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return adjusted.getDay();
}

/**
 * Formats the logical date for display in pt-BR.
 */
export function formatLogicalDate(date: Date): string {
  const adjusted = new Date(date);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const DAY_NAMES = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado",
  ];
  const dayName = DAY_NAMES[adjusted.getDay()];
  const day = adjusted.getDate();
  const month = adjusted.toLocaleDateString("pt-BR", { month: "long" });
  return `${dayName}, ${day} de ${month}`;
}

/**
 * Returns the ISO week ID (e.g. "2026-W09") for a given date string (YYYY-MM-DD).
 * Uses ISO 8601 week numbering (Monday-based).
 */
export function getWeekIdForDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  // ISO week: Monday is first day of week, week 1 contains Jan 4th
  const dayOfWeek = d.getDay() || 7; // Convert Sunday=0 to 7
  // Set to nearest Thursday (ISO week date algorithm)
  d.setDate(d.getDate() + 4 - dayOfWeek);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1) / 7
  );
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}
