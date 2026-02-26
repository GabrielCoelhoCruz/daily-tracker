import { Periodo } from "@/data/plano";
import { treinos, Treino } from "@/data/treinos";

/**
 * Training days are Monday(1) through Friday(5).
 * diaOffManual overrides to force a rest day.
 */
export function isDiaDeTreino(
  dayOfWeek: number,
  diaOffManual: boolean
): boolean {
  if (diaOffManual) return false;
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Returns the workout for the given day of week.
 * Monday=1 → A, Tuesday=2 → B, ..., Friday=5 → E.
 * Returns null for weekends (0=Sunday, 6=Saturday).
 */
export function getTreinoDoDia(dayOfWeek: number): Treino | null {
  if (dayOfWeek < 1 || dayOfWeek > 5) return null;
  return treinos[dayOfWeek - 1] ?? null;
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
