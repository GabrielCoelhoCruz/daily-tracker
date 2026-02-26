import { plano } from "@/data/plano";
import { useDayStore } from "@/stores/useDayStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { filtrarItensDoDia } from "@/utils/diaUtils";

/**
 * Returns the "logical date" string (YYYY-MM-DD) for a given Date,
 * using 4am as the day boundary. Before 4am counts as the previous day.
 */
function getLogicalDate(date: Date): string {
  const adjusted = new Date(date);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return adjusted.toISOString().split("T")[0];
}

/**
 * Returns the ISO week ID (e.g. "2026-W09") for a given date string.
 */
function getWeekIdForDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const year = d.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  const weekNumber = Math.ceil(
    (diff / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7
  );
  return `${year}-W${weekNumber}`;
}

/**
 * Collects IDs of unchecked non-optional items for the given date's filtered plan.
 */
function getItensPerdidos(
  checks: Record<string, { checked: boolean; timestamp: number }>,
  dateStr: string
): string[] {
  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.getDay();
  const diaOff = useDayStore.getState().diaOffManual;

  const periodosFiltrados = filtrarItensDoDia(
    plano.periodos,
    dayOfWeek,
    diaOff
  );

  const perdidos: string[] = [];

  for (const periodo of periodosFiltrados) {
    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional && !checks[sub.id]?.checked) {
            perdidos.push(sub.nome);
          }
        }
      } else {
        if (!item.opcional && !checks[item.id]?.checked) {
          perdidos.push(item.nome);
        }
      }
    }
  }

  return perdidos;
}

/**
 * Checks if the day has changed (using 4am cutoff) and performs reset:
 * 1. Saves history for the previous day (itensPerdidos from unchecked items)
 * 2. Resets the day store
 * 3. If new week (Monday), also resets free meal state
 */
export function checkAndReset(): void {
  const dayState = useDayStore.getState();
  const { ultimoReset, checks } = dayState;
  const now = new Date();
  const logicalToday = getLogicalDate(now);

  if (ultimoReset === logicalToday) {
    return;
  }

  // Day changed — save history for the ultimoReset date
  const periodosFiltrados = filtrarItensDoDia(
    plano.periodos,
    new Date(ultimoReset + "T12:00:00").getDay(),
    dayState.diaOffManual
  );

  let total = 0;
  let completados = 0;

  for (const periodo of periodosFiltrados) {
    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional) {
            total++;
            if (checks[sub.id]?.checked) completados++;
          }
        }
      } else {
        if (!item.opcional) {
          total++;
          if (checks[item.id]?.checked) completados++;
        }
      }
    }
  }

  const itensPerdidos = getItensPerdidos(checks, ultimoReset);

  useHistoryStore.getState().salvarDia({
    data: ultimoReset,
    completados,
    total,
    itensPerdidos,
  });

  // Reset day state
  useDayStore.getState().resetDay();

  // If new week, also reset free meal
  const currentWeek = getWeekIdForDate(logicalToday);
  const previousWeek = dayState.semanaRefeicaoLivre;

  if (currentWeek !== previousWeek) {
    useDayStore.setState({
      refeicaoLivreUsada: false,
      refeicaoLivrePeriodoId: null,
      semanaRefeicaoLivre: currentWeek,
    });
  }
}
