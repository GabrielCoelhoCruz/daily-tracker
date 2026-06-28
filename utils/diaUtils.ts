import { Periodo } from "@/data/plano";
import { treinos, Treino } from "@/data/treinos";
import {
  DEFAULT_SPLIT_WEEK_PLAN,
  getTreinoFromWeekPlan,
  getWeekDaySlot,
  type SplitWeekPlan,
} from "@/utils/splitWeekUtils";

/**
 * Training day when the week plan assigns a treino slot and diaOffManual is false.
 */
export function isDiaDeTreino(
  dayOfWeek: number,
  diaOffManual: boolean,
  plan: SplitWeekPlan = DEFAULT_SPLIT_WEEK_PLAN,
): boolean {
  if (diaOffManual) return false;
  return getWeekDaySlot(dayOfWeek, plan).kind === "treino";
}

/**
 * Legacy helper — scheduled treino from classic Mon→A mapping.
 * Prefer getTreinoFromWeekPlan with the user's splitWeekPlan.
 */
export function getTreinoDoDia(dayOfWeek: number): Treino | null {
  if (dayOfWeek < 1 || dayOfWeek > 5) return null;
  return treinos[dayOfWeek - 1] ?? null;
}

export function getTreinoById(treinoId: string): Treino | null {
  return treinos.find((treino) => treino.id === treinoId) ?? null;
}

type ResolveTreinoOptions = {
  todayDay?: number;
  treinoHojeId?: string | null;
  splitWeekPlan?: SplitWeekPlan;
};

/**
 * Resolves which workout applies for a calendar day from the editable week plan.
 * When viewing today, `treinoHojeId` can override (one-off swap).
 */
export function resolveTreinoForDay(
  dayOfWeek: number,
  options?: ResolveTreinoOptions,
): Treino | null {
  const plan = options?.splitWeekPlan ?? DEFAULT_SPLIT_WEEK_PLAN;
  const scheduled = getTreinoFromWeekPlan(dayOfWeek, plan);
  const { todayDay, treinoHojeId } = options ?? {};

  if (todayDay === dayOfWeek && treinoHojeId) {
    return getTreinoById(treinoHojeId) ?? scheduled;
  }

  return scheduled;
}

export function isTreinoSwappedToday(
  todayDay: number,
  treinoHojeId: string | null | undefined,
  plan: SplitWeekPlan = DEFAULT_SPLIT_WEEK_PLAN,
): boolean {
  if (!treinoHojeId) return false;
  const scheduled = getTreinoFromWeekPlan(todayDay, plan);
  return scheduled != null && scheduled.id !== treinoHojeId;
}

export function getScheduledTreinoForDay(
  dayOfWeek: number,
  plan: SplitWeekPlan = DEFAULT_SPLIT_WEEK_PLAN,
): Treino | null {
  return getTreinoFromWeekPlan(dayOfWeek, plan);
}

function itemMatchesDay(
  regra: { diasDaSemana?: number[]; apenasEmDiaDeTreino?: boolean } | undefined,
  dayOfWeek: number,
  treino: boolean
): boolean {
  if (!regra) return true;
  if (regra.diasDaSemana && !regra.diasDaSemana.includes(dayOfWeek)) {
    return false;
  }
  if (regra.apenasEmDiaDeTreino && !treino) {
    return false;
  }
  return true;
}

/**
 * Filters periods and their items based on day-of-week rules and training day status.
 * - Removes entire periods whose regra doesn't match
 * - Within remaining periods, removes items whose regra doesn't match
 * - Filters sub-items the same way
 */
export function filtrarItensDoDia(
  periodos: Periodo[],
  dayOfWeek: number,
  diaOffManual: boolean
): Periodo[] {
  const treino = isDiaDeTreino(dayOfWeek, diaOffManual);

  return periodos
    .filter((periodo) => itemMatchesDay(periodo.regra, dayOfWeek, treino))
    .map((periodo) => ({
      ...periodo,
      itens: periodo.itens
        .filter((item) => itemMatchesDay(item.regra, dayOfWeek, treino))
        .map((item) => {
          if (!item.subItens) return item;
          return {
            ...item,
            subItens: item.subItens.filter((sub) =>
              itemMatchesDay(sub.regra, dayOfWeek, treino)
            ),
          };
        }),
    }))
    .filter((periodo) => periodo.itens.length > 0);
}

/**
 * Counts checkable items across periods.
 * - `total` excludes optional items (used for progress calculation)
 * - `totalComOpcionais` includes all items
 * Sub-items count individually; the parent "Suplementos" item does not count.
 */
export function contarItens(periodos: Periodo[]): {
  total: number;
  totalComOpcionais: number;
} {
  let total = 0;
  let totalComOpcionais = 0;

  for (const periodo of periodos) {
    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        // Parent with sub-items: count each sub-item, not the parent
        for (const sub of item.subItens) {
          totalComOpcionais++;
          if (!sub.opcional) total++;
        }
      } else {
        totalComOpcionais++;
        if (!item.opcional) total++;
      }
    }
  }

  return { total, totalComOpcionais };
}
