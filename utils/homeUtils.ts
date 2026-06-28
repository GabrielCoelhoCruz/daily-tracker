import type { Periodo } from "@/data/plano"
import type { Treino } from "@/data/treinos"
import { contarItens } from "@/utils/diaUtils"
import type { TodayTrainingBriefing } from "@/utils/todayTrainingUtils"
import {
  formatTodayTrainingEvidence,
  needsTodayTrainingAction,
} from "@/utils/todayTrainingUtils"

export const PREP_PHASE_LABEL = "Cutting Prep"

type CheckState = {
  checked: boolean
  timestamp: number
}

export type ProtocolProgress = {
  completed: number
  total: number
  remaining: number
  percentage: number
}

export type HomeAction =
  | {
      type: "hydration"
      title: string
      subtitle: string
      cta: string
    }
  | {
      type: "cardio"
      title: string
      subtitle: string
      cta: string
    }
  | {
      type: "meal"
      title: string
      subtitle: string
      cta: string
      periodoId: string
    }
  | {
      type: "workout"
      title: string
      subtitle: string
      cta: string
    }
  | {
      type: "complete"
      title: string
      subtitle: string
      cta: string
    }

export type DailyMetricKind = "water" | "cardio" | "diet" | "workout"

export type DailyMetricSummary = {
  kind: DailyMetricKind
  label: string
  value: string
  detail: string
  sf: string
  mci: string
}

export type TodayWorkoutSummary =
  | {
      kind: "training"
      title: string
      subtitle: string
      firstExercise: string
    }
  | {
      kind: "rest"
      title: string
      subtitle: string
    }
  | {
      kind: "dayOff"
      title: string
      subtitle: string
    }

const HYDRATION_BEHIND_RATIO = 0.5

function countCheckableInPeriod(periodo: Periodo): number {
  let count = 0
  for (const item of periodo.itens) {
    if (item.subItens && item.subItens.length > 0) {
      count += item.subItens.length
    } else {
      count++
    }
  }
  return count
}

function countCheckedInPeriod(
  periodo: Periodo,
  checks: Record<string, CheckState>
): number {
  let count = 0
  for (const item of periodo.itens) {
    if (item.subItens && item.subItens.length > 0) {
      for (const sub of item.subItens) {
        if (checks[sub.id]?.checked) count++
      }
    } else if (checks[item.id]?.checked) {
      count++
    }
  }
  return count
}

function countNonOptionalChecked(
  periodos: Periodo[],
  checks: Record<string, CheckState>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): number {
  let count = 0
  for (const periodo of periodos) {
    const isRefeicaoLivre =
      refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id

    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional) {
            if (isRefeicaoLivre || checks[sub.id]?.checked) count++
          }
        }
      } else if (!item.opcional) {
        if (isRefeicaoLivre || checks[item.id]?.checked) count++
      }
    }
  }
  return count
}

function countRemainingNonOptionalInPeriod(
  periodo: Periodo,
  checks: Record<string, CheckState>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): number {
  if (refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id) {
    return 0
  }

  let remaining = 0
  for (const item of periodo.itens) {
    if (item.subItens && item.subItens.length > 0) {
      for (const sub of item.subItens) {
        if (!sub.opcional && !checks[sub.id]?.checked) remaining++
      }
    } else if (!item.opcional && !checks[item.id]?.checked) {
      remaining++
    }
  }
  return remaining
}

export function isPeriodComplete(
  periodo: Periodo,
  checks: Record<string, CheckState>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): boolean {
  if (refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id) {
    return true
  }

  const total = countCheckableInPeriod(periodo)
  const checked = countCheckedInPeriod(periodo, checks)
  return total > 0 && checked === total
}

function isMealPeriod(periodo: Periodo): boolean {
  return periodo.itens.some((item) => item.categoria === "refeicao")
}

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(2)
}

function formatGoalLiters(ml: number): string {
  return (ml / 1000).toFixed(1) + "L"
}

export function getTodayProtocolProgress(
  periodos: Periodo[],
  checks: Record<string, CheckState>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): ProtocolProgress {
  const { total } = contarItens(periodos)
  const completed = countNonOptionalChecked(
    periodos,
    checks,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId
  )
  const remaining = Math.max(0, total - completed)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { completed, total, remaining, percentage }
}

export function getNextHomeAction(input: {
  periodos: Periodo[]
  checks: Record<string, CheckState>
  refeicaoLivreUsada: boolean
  refeicaoLivrePeriodoId: string | null
  aguaMl: number
  metaAguaMl: number
  cardioMinutos: number
  metaCardioMin: number
  isTrainingDay: boolean
  treino: Treino | null
  workoutLogged?: boolean
  trainingBriefing?: TodayTrainingBriefing | null
}): HomeAction {
  const {
    periodos,
    checks,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId,
    aguaMl,
    metaAguaMl,
    cardioMinutos,
    metaCardioMin,
    isTrainingDay,
    treino,
    workoutLogged = false,
    trainingBriefing,
  } = input

  const hydrationBehind =
    metaAguaMl > 0 && aguaMl < metaAguaMl * HYDRATION_BEHIND_RATIO

  if (hydrationBehind) {
    return {
      type: "hydration",
      title: "Hidratação",
      subtitle: `${formatLiters(aguaMl)} / ${formatGoalLiters(metaAguaMl)} registrados`,
      cta: "Registrar água",
    }
  }

  const firstIncompleteMeal = periodos.find(
    (periodo) =>
      isMealPeriod(periodo) &&
      !isPeriodComplete(
        periodo,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId
      )
  )

  if (firstIncompleteMeal) {
    const remaining = countRemainingNonOptionalInPeriod(
      firstIncompleteMeal,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId
    )
    const descricao = firstIncompleteMeal.descricao
      ? `${firstIncompleteMeal.descricao} · `
      : ""

    return {
      type: "meal",
      title: firstIncompleteMeal.nome,
      subtitle: `${descricao}${remaining} ${remaining === 1 ? "item restante" : "itens restantes"}`,
      cta: "Abrir checklist",
      periodoId: firstIncompleteMeal.id,
    }
  }

  if (metaCardioMin > 0 && cardioMinutos < metaCardioMin) {
    const remaining = metaCardioMin - cardioMinutos
    return {
      type: "cardio",
      title: "Cardio",
      subtitle: `${cardioMinutos} / ${metaCardioMin} min · faltam ${remaining} min`,
      cta: "Registrar cardio",
    }
  }

  const trainingNeedsAction = trainingBriefing
    ? needsTodayTrainingAction(trainingBriefing)
    : isTrainingDay && treino && !workoutLogged

  if (trainingNeedsAction && treino) {
    const briefing = trainingBriefing
    const subtitle = briefing
      ? briefing.currentSetLabel
        ? `${briefing.subtitle} · ${briefing.currentSetLabel}`
        : briefing.subtitle
      : `${treino.grupoMuscular} · ainda não iniciado`

    const cta = briefing?.nextActionLabel ?? "Iniciar log de treino"

    return {
      type: "workout",
      title: briefing?.title ?? `Treino ${treino.letra}`,
      subtitle,
      cta,
    }
  }

  return {
    type: "complete",
    title: "Protocolo em dia",
    subtitle: "Mantenha o ritmo de hoje",
    cta: "Ver checklist",
  }
}

export function getDailyMetricSummaries(input: {
  periodos: Periodo[]
  checks: Record<string, CheckState>
  refeicaoLivreUsada: boolean
  refeicaoLivrePeriodoId: string | null
  aguaMl: number
  metaAguaMl: number
  cardioMinutos: number
  metaCardioMin: number
  isTrainingDay: boolean
  diaOffManual: boolean
  treino: Treino | null
  trainingBriefing?: TodayTrainingBriefing | null
  kinds?: DailyMetricKind[]
}): DailyMetricSummary[] {
  const {
    periodos,
    checks,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId,
    aguaMl,
    metaAguaMl,
    cardioMinutos,
    metaCardioMin,
    isTrainingDay,
    diaOffManual,
    treino,
    trainingBriefing,
  } = input

  const mealPeriods = periodos.filter(isMealPeriod)
  const completedMeals = mealPeriods.filter((periodo) =>
    isPeriodComplete(
      periodo,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId
    )
  ).length

  let workoutValue = "Descanso"
  let workoutDetail = "Sem treino"

  if (diaOffManual) {
    workoutValue = "Dia off"
    workoutDetail = "Pausado"
  } else if (trainingBriefing && trainingBriefing.status !== "no-training") {
    workoutValue = trainingBriefing.title
    workoutDetail =
      formatTodayTrainingEvidence(trainingBriefing) ??
      trainingBriefing.subtitle
  } else if (isTrainingDay && treino) {
    workoutValue = treino.grupoMuscular
    workoutDetail = `Treino ${treino.letra}`
  }

  const allMetrics: DailyMetricSummary[] = [
    {
      kind: "water",
      label: "Água",
      value: `${formatLiters(aguaMl)} / ${formatGoalLiters(metaAguaMl)}`,
      detail:
        aguaMl >= metaAguaMl
          ? "Meta atingida"
          : `${Math.round((aguaMl / metaAguaMl) * 100)}% da meta`,
      sf: "drop.fill",
      mci: "water",
    },
    {
      kind: "cardio",
      label: "Cardio",
      value: `${cardioMinutos} / ${metaCardioMin}min`,
      detail:
        cardioMinutos >= metaCardioMin
          ? "Meta atingida"
          : `Faltam ${metaCardioMin - cardioMinutos} min`,
      sf: "figure.run",
      mci: "run",
    },
    {
      kind: "diet",
      label: "Refeições",
      value: `${completedMeals} / ${mealPeriods.length}`,
      detail:
        mealPeriods.length === 0
          ? "Sem refeições hoje"
          : completedMeals === mealPeriods.length
            ? "Todas concluídas"
            : `${mealPeriods.length - completedMeals} pendentes`,
      sf: "fork.knife",
      mci: "food-apple-outline",
    },
    {
      kind: "workout",
      label: "Treino",
      value: workoutValue,
      detail: workoutDetail,
      sf: "dumbbell.fill",
      mci: "dumbbell",
    },
  ]

  if (input.kinds) {
    return allMetrics.filter((metric) => input.kinds!.includes(metric.kind))
  }

  return allMetrics
}

export function getTodayWorkoutSummary(input: {
  isTrainingDay: boolean
  diaOffManual: boolean
  treino: Treino | null
}): TodayWorkoutSummary {
  const { isTrainingDay, diaOffManual, treino } = input

  if (diaOffManual) {
    return {
      kind: "dayOff",
      title: "Dia Off",
      subtitle: "Treino pausado para hoje",
    }
  }

  if (!isTrainingDay || !treino) {
    return {
      kind: "rest",
      title: "Dia de Recuperação",
      subtitle: "Nenhum treino agendado",
    }
  }

  const firstExercise = treino.exercicios[0]?.nome ?? "Ver exercícios"

  return {
    kind: "training",
    title: `Treino ${treino.letra} · ${treino.grupoMuscular}`,
    subtitle: "Começa com",
    firstExercise,
  }
}

export function getTodayHeaderSubtitle(input: {
  isTrainingDay: boolean
  diaOffManual: boolean
  treino: Treino | null
}): string {
  const { isTrainingDay, diaOffManual, treino } = input

  if (diaOffManual) {
    return `Dia de Recuperação · ${PREP_PHASE_LABEL}`
  }

  if (isTrainingDay && treino) {
    return `${treino.grupoMuscular} · ${PREP_PHASE_LABEL}`
  }

  return `Dia de Recuperação · ${PREP_PHASE_LABEL}`
}
