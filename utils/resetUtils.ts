import { plano } from "@/data/plano";
import { useDayStore } from "@/stores/useDayStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { filtrarItensDoDia } from "@/utils/diaUtils";
import { getLogicalDate, getWeekIdForDate } from "@/utils/dateUtils";

/**
 * Collects IDs of unchecked non-optional items for the given date's filtered plan.
 */
function getItensPerdidos(
  checks: Record<string, { checked: boolean; timestamp: number }>,
  dateStr: string,
  diaOff: boolean,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): string[] {
  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.getDay();

  const periodosFiltrados = filtrarItensDoDia(
    plano.periodos,
    dayOfWeek,
    diaOff
  );

  const perdidos: string[] = [];

  for (const periodo of periodosFiltrados) {
    const isRefeicaoLivre =
      refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id;
    if (isRefeicaoLivre) continue;

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

  const { refeicaoLivreUsada, refeicaoLivrePeriodoId } = dayState;

  let total = 0;
  let completados = 0;

  for (const periodo of periodosFiltrados) {
    const isRefeicaoLivre =
      refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id;

    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional) {
            total++;
            if (isRefeicaoLivre || checks[sub.id]?.checked) completados++;
          }
        }
      } else {
        if (!item.opcional) {
          total++;
          if (isRefeicaoLivre || checks[item.id]?.checked) completados++;
        }
      }
    }
  }

  const itensPerdidos = getItensPerdidos(
    checks,
    ultimoReset,
    dayState.diaOffManual,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId
  );

  useHistoryStore.getState().salvarDia({
    data: ultimoReset,
    completados,
    total,
    itensPerdidos,
  });

  // Reset day state with logical date (4am boundary)
  useDayStore.getState().resetDay(logicalToday);

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
