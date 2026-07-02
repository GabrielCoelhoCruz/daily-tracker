import type { Periodo } from '@/data/plano'
import { getMealProgress } from '@/utils/dailyCloseoutUtils'
import { isPeriodComplete } from '@/utils/homeUtils'

export type DailyProtocolStatus = 'complete' | 'pending' | 'leak' | 'day-off'

export type DailyProtocolSummary = {
  status: DailyProtocolStatus
  title: string
  mealsCompleted: number
  mealsTotal: number
  mealsLabel: string
  waterLabel: string
  cardioLabel: string
  nextPendingLabel: string | null
  evidenceLine: string
}

type CheckState = {
  checked: boolean
  timestamp: number
}

export type DailyProtocolSummaryInput = {
  periodos: Periodo[]
  checks: Record<string, CheckState>
  refeicaoLivreUsada: boolean
  refeicaoLivrePeriodoId: string | null
  aguaMl: number
  metaAguaMl: number
  cardioMinutos: number
  metaCardioMin: number
  diaOffManual: boolean
}

function isMealPeriod(periodo: Periodo): boolean {
  return periodo.itens.some((item) => item.categoria === 'refeicao')
}

function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`
}

function formatGoalLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`
}

export function getProtocolMealsSummary(
  input: Pick<
    DailyProtocolSummaryInput,
    'periodos' | 'checks' | 'refeicaoLivreUsada' | 'refeicaoLivrePeriodoId'
  >,
): { completed: number; total: number; label: string } {
  const meals = getMealProgress({
    periodos: input.periodos,
    checks: input.checks,
    refeicaoLivreUsada: input.refeicaoLivreUsada,
    refeicaoLivrePeriodoId: input.refeicaoLivrePeriodoId,
  })

  const resolved = meals.completed + meals.partial
  const partialSuffix =
    meals.partial > 0
      ? ` · ${meals.partial} parcial${meals.partial === 1 ? '' : 'is'}`
      : ''

  return {
    completed: resolved,
    total: meals.total,
    label:
      meals.total === 0
        ? 'Sem refeições hoje'
        : `${resolved}/${meals.total} resolvidas${partialSuffix}`,
  }
}

export function getProtocolHydrationSummary(
  aguaMl: number,
  metaAguaMl: number,
): string {
  if (metaAguaMl <= 0) return '—'
  return `${formatLiters(aguaMl)}/${formatGoalLiters(metaAguaMl)}`
}

export function getProtocolCardioSummary(
  cardioMinutos: number,
  metaCardioMin: number,
): string {
  if (metaCardioMin <= 0) return '—'
  return `${cardioMinutos}/${metaCardioMin}min`
}

export function getNextProtocolPending(
  input: DailyProtocolSummaryInput,
): string | null {
  if (input.diaOffManual) return null

  const mealPeriods = input.periodos.filter(isMealPeriod)
  for (const periodo of mealPeriods) {
    if (
      !isPeriodComplete(
        periodo,
        input.checks,
        input.refeicaoLivreUsada,
        input.refeicaoLivrePeriodoId,
      )
    ) {
      return periodo.nome
    }
  }

  if (input.metaAguaMl > 0 && input.aguaMl < input.metaAguaMl) {
    return 'Hidratação pendente'
  }

  if (input.metaCardioMin > 0 && input.cardioMinutos < input.metaCardioMin) {
    return 'Cardio pendente'
  }

  return null
}

export function isProtocolComplete(input: DailyProtocolSummaryInput): boolean {
  const meals = getMealProgress({
    periodos: input.periodos,
    checks: input.checks,
    refeicaoLivreUsada: input.refeicaoLivreUsada,
    refeicaoLivrePeriodoId: input.refeicaoLivrePeriodoId,
  })

  const mealsDone =
    meals.total === 0 || meals.completed + meals.partial >= meals.total
  const waterDone = input.metaAguaMl <= 0 || input.aguaMl >= input.metaAguaMl
  const cardioDone =
    input.metaCardioMin <= 0 || input.cardioMinutos >= input.metaCardioMin

  return mealsDone && waterDone && cardioDone
}

export function formatProtocolEvidenceLine(
  input: DailyProtocolSummaryInput,
): string {
  const parts: string[] = []
  const meals = getProtocolMealsSummary(input)

  if (meals.total > 0) {
    parts.push(`Refeições ${meals.completed}/${meals.total}`)
  }

  if (input.metaAguaMl > 0) {
    parts.push(
      `Água ${formatLiters(input.aguaMl)}/${formatGoalLiters(input.metaAguaMl)}`,
    )
  }

  if (input.metaCardioMin > 0) {
    parts.push(`Cardio ${input.cardioMinutos}/${input.metaCardioMin}min`)
  }

  return parts.join(' · ')
}

function resolveProtocolStatus(
  input: DailyProtocolSummaryInput,
): DailyProtocolStatus {
  if (input.diaOffManual) return 'day-off'
  if (isProtocolComplete(input)) return 'complete'

  const meals = getMealProgress({
    periodos: input.periodos,
    checks: input.checks,
    refeicaoLivreUsada: input.refeicaoLivreUsada,
    refeicaoLivrePeriodoId: input.refeicaoLivrePeriodoId,
  })

  const hasMealGap =
    meals.total > 0 && meals.completed + meals.partial < meals.total
  const hasWaterGap =
    input.metaAguaMl > 0 && input.aguaMl < input.metaAguaMl * 0.5
  const hasCardioGap =
    input.metaCardioMin > 0 &&
    input.cardioMinutos < input.metaCardioMin * 0.5

  if (hasMealGap || hasWaterGap || hasCardioGap) {
    return 'leak'
  }

  return 'pending'
}

export function getDailyProtocolSummary(
  input: DailyProtocolSummaryInput,
): DailyProtocolSummary {
  const meals = getProtocolMealsSummary(input)
  const status = resolveProtocolStatus(input)
  const nextPendingLabel = getNextProtocolPending(input)
  const evidenceLine = formatProtocolEvidenceLine(input)

  const title =
    status === 'day-off'
      ? 'Protocolo pausado'
      : status === 'complete'
        ? 'Protocolo completo'
        : status === 'leak'
          ? 'Protocolo com vazamentos'
          : 'Protocolo pendente'

  return {
    status,
    title,
    mealsCompleted: meals.completed,
    mealsTotal: meals.total,
    mealsLabel: meals.label,
    waterLabel: getProtocolHydrationSummary(input.aguaMl, input.metaAguaMl),
    cardioLabel: getProtocolCardioSummary(
      input.cardioMinutos,
      input.metaCardioMin,
    ),
    nextPendingLabel,
    evidenceLine,
  }
}
