import { getActivePlano } from "@/stores/useProtocolStore";
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
    getActivePlano().periodos,
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

  // Fechamento explícito tem precedência: se o usuário já fechou o dia
  // (closeoutSavedAt), o rollover nunca sobrescreve esse registro.
  const existingEntry = useHistoryStore.getState().dias[ultimoReset];
  if (existingEntry?.closeoutSavedAt) {
    resetDayState(dayState, logicalToday);
    return;
  }

  // Day changed — save history for the ultimoReset date
  const periodosFiltrados = filtrarItensDoDia(
    getActivePlano().periodos,
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

  // O rollover só registra dias com execução real (algo foi marcado).
  // A entrada é marcada como autoRollover e nunca recebe closeoutSavedAt,
  // portanto não conta como dia fechado, score semanal ou resumo do coach.
  if (completados > 0) {
    useHistoryStore.getState().salvarDia({
      data: ultimoReset,
      completados,
      total,
      itensPerdidos,
      autoRollover: true,
    });
  }

  resetDayState(dayState, logicalToday);
}

type DayStateForReset = {
  semanaRefeicaoLivre: string;
};

/** Reseta o dia e, se a semana virou, a refeição livre. */
function resetDayState(dayState: DayStateForReset, logicalToday: string): void {
  useDayStore.getState().resetDay(logicalToday);

  const currentWeek = getWeekIdForDate(logicalToday);
  if (currentWeek !== dayState.semanaRefeicaoLivre) {
    useDayStore.setState({
      refeicaoLivreUsada: false,
      refeicaoLivrePeriodoId: null,
      semanaRefeicaoLivre: currentWeek,
    });
  }
}
