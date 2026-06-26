import { useMemo } from "react";
import { plano } from "@/data/plano";
import { useDayStore } from "@/stores/useDayStore";
import {
  contarItens,
  filtrarItensDoDia,
  isDiaDeTreino,
} from "@/utils/diaUtils";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import type { Periodo } from "@/data/plano";

function countCheckedNonOptional(
  periodos: Periodo[],
  checks: Record<string, { checked: boolean; timestamp: number }>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): number {
  let count = 0;
  for (const periodo of periodos) {
    const isRefeicaoLivre =
      refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id;

    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional) {
            if (isRefeicaoLivre || checks[sub.id]?.checked) count++;
          }
        }
      } else if (!item.opcional) {
        if (isRefeicaoLivre || checks[item.id]?.checked) count++;
      }
    }
  }
  return count;
}

/** Unchecked non-optional items for today's filtered plan — used for NativeTabs badge. */
export function usePendingDashCount(): number {
  const checks = useDayStore((s) => s.checks);
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const refeicaoLivreUsada = useDayStore((s) => s.refeicaoLivreUsada);
  const refeicaoLivrePeriodoId = useDayStore((s) => s.refeicaoLivrePeriodoId);

  return useMemo(() => {
    const dayOfWeek = getLogicalDayOfWeek(new Date());
    if (!isDiaDeTreino(dayOfWeek, diaOffManual) && diaOffManual) {
      // rest day with manual off — still show nutrition items if any
    }
    const periodos = filtrarItensDoDia(plano.periodos, dayOfWeek, diaOffManual);
    const { total } = contarItens(periodos);
    const completados = countCheckedNonOptional(
      periodos,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId
    );
    return Math.max(0, total - completados);
  }, [
    checks,
    diaOffManual,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId,
  ]);
}
