import type { Periodo } from '@/data/plano'
import type { HistoricoDia } from '@/stores/useHistoryStore'
import type { TodayTrainingBriefing } from '@/utils/todayTrainingUtils'
import {
  getTodayProtocolProgress,
  isPeriodComplete,
} from '@/utils/homeUtils'

export type DailyLeakType =
  | 'meal'
  | 'hydration'
  | 'cardio'
  | 'training'
  | 'check-in'

export type DailyLeak = {
  type: DailyLeakType
  title: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
}

export type DailyCloseoutSummary = {
  date: string
  executionScore: number
  isReadyToClose: boolean
  title: string
  subtitle: string
  evidence: string
  leaks: DailyLeak[]
  primaryLeak: DailyLeak | null
  primaryActionLabel: string
}

type CheckState = {
  checked: boolean
  timestamp: number
}

export type DailyCloseoutInput = {
  date: string
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
  trainingBriefing: TodayTrainingBriefing
}

const SCORE_WEIGHTS_TRAINING = {
  meals: 0.3,
  hydration: 0.2,
  cardio: 0.2,
  training: 0.3,
} as const

const SCORE_WEIGHTS_REST = {
  meals: 0.4,
  hydration: 0.3,
  cardio: 0.3,
} as const

function isMealPeriod(periodo: Periodo): boolean {
  return periodo.itens.some((item) => item.categoria === 'refeicao')
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function ratioScore(completed: number, total: number): number {
  if (total <= 0) return 100
  return clampPercent((completed / total) * 100)
}

function targetScore(current: number, target: number): number {
  if (target <= 0) return 100
  return clampPercent((current / target) * 100)
}

export function getMealProgress(input: Pick<
  DailyCloseoutInput,
  'periodos' | 'checks' | 'refeicaoLivreUsada' | 'refeicaoLivrePeriodoId'
>): { completed: number; total: number; score: number } {
  const mealPeriods = input.periodos.filter(isMealPeriod)
  const completed = mealPeriods.filter((periodo) =>
    isPeriodComplete(
      periodo,
      input.checks,
      input.refeicaoLivreUsada,
      input.refeicaoLivrePeriodoId,
    ),
  ).length

  return {
    completed,
    total: mealPeriods.length,
    score: ratioScore(completed, mealPeriods.length),
  }
}

export function getTrainingProgressScore(
  briefing: TodayTrainingBriefing,
  isTrainingDay: boolean,
  diaOffManual: boolean,
): number | null {
  if (!isTrainingDay || diaOffManual || briefing.status === 'no-training') {
    return null
  }

  if (briefing.status === 'pending') {
    return 0
  }

  if (briefing.status === 'complete') {
    return 100
  }

  if (briefing.totalSets <= 0) {
    return 0
  }

  return ratioScore(briefing.completedSets, briefing.totalSets)
}

export function getDailyExecutionScore(input: DailyCloseoutInput): number {
  const meals = getMealProgress(input)
  const hydrationScore = targetScore(input.aguaMl, input.metaAguaMl)
  const cardioScore = targetScore(input.cardioMinutos, input.metaCardioMin)
  const trainingScore = getTrainingProgressScore(
    input.trainingBriefing,
    input.isTrainingDay,
    input.diaOffManual,
  )

  if (trainingScore == null) {
    const weights = SCORE_WEIGHTS_REST
    return clampPercent(
      meals.score * weights.meals +
        hydrationScore * weights.hydration +
        cardioScore * weights.cardio,
    )
  }

  const weights = SCORE_WEIGHTS_TRAINING
  return clampPercent(
    meals.score * weights.meals +
      hydrationScore * weights.hydration +
      cardioScore * weights.cardio +
      trainingScore * weights.training,
  )
}

function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`
}

function formatGoalLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`
}

export function getDailyLeaks(input: DailyCloseoutInput): DailyLeak[] {
  const leaks: DailyLeak[] = []
  const meals = getMealProgress(input)

  if (meals.total > 0 && meals.completed < meals.total) {
    const pending = meals.total - meals.completed
    leaks.push({
      type: 'meal',
      title:
        pending === 1
          ? '1 refeição incompleta'
          : `${pending} refeições incompletas`,
      evidence: `Refeições ${meals.completed}/${meals.total}`,
      severity: pending >= 2 ? 'high' : 'medium',
    })
  }

  if (input.metaAguaMl > 0 && input.aguaMl < input.metaAguaMl) {
    const deficitMl = input.metaAguaMl - input.aguaMl
    leaks.push({
      type: 'hydration',
      title: 'Hidratação abaixo do alvo',
      evidence: `Água ${formatLiters(input.aguaMl)}/${formatGoalLiters(input.metaAguaMl)}`,
      severity: deficitMl > input.metaAguaMl * 0.25 ? 'medium' : 'low',
    })
  }

  if (input.metaCardioMin > 0 && input.cardioMinutos < input.metaCardioMin) {
    const deficit = input.metaCardioMin - input.cardioMinutos
    leaks.push({
      type: 'cardio',
      title: `Cardio ${deficit}min abaixo`,
      evidence: `Cardio ${input.cardioMinutos}/${input.metaCardioMin}min`,
      severity: deficit >= 30 ? 'high' : 'medium',
    })
  }

  const { trainingBriefing, isTrainingDay, diaOffManual } = input

  if (
    isTrainingDay &&
    !diaOffManual &&
    trainingBriefing.status !== 'no-training'
  ) {
    if (trainingBriefing.status === 'pending') {
      leaks.push({
        type: 'training',
        title: 'Treino pendente',
        evidence: trainingBriefing.workoutLabel ?? 'Treino não iniciado',
        severity: 'high',
      })
    } else if (
      trainingBriefing.status === 'in-progress' ||
      trainingBriefing.status === 'incomplete'
    ) {
      const pendingSets =
        trainingBriefing.totalSets - trainingBriefing.completedSets
      leaks.push({
        type: 'training',
        title: 'Vazamento no treino',
        evidence: `${trainingBriefing.completedSets}/${trainingBriefing.totalSets} sets registrados`,
        severity: pendingSets >= 4 ? 'high' : 'medium',
      })
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 }
  return leaks.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  )
}

export function getCloseoutReadiness(input: DailyCloseoutInput): boolean {
  return getDailyLeaks(input).length === 0
}

export function formatCloseoutEvidence(input: DailyCloseoutInput): string {
  const parts: string[] = []
  const meals = getMealProgress(input)
  const { trainingBriefing, isTrainingDay, diaOffManual } = input

  if (
    isTrainingDay &&
    !diaOffManual &&
    trainingBriefing.status !== 'no-training' &&
    trainingBriefing.status !== 'pending'
  ) {
    if (trainingBriefing.totalSets > 0) {
      parts.push(
        `Treino ${trainingBriefing.completedSets}/${trainingBriefing.totalSets} sets`,
      )
    } else if (trainingBriefing.volumeKg > 0) {
      parts.push(`Volume ${trainingBriefing.volumeKg.toLocaleString('pt-BR')}kg`)
    }
  } else if (
    isTrainingDay &&
    !diaOffManual &&
    trainingBriefing.status === 'pending'
  ) {
    parts.push('Treino pendente')
  }

  if (input.metaAguaMl > 0) {
    parts.push(
      `Água ${formatLiters(input.aguaMl)}/${formatGoalLiters(input.metaAguaMl)}`,
    )
  }

  if (meals.total > 0) {
    parts.push(`Refeições ${meals.completed}/${meals.total}`)
  }

  if (input.metaCardioMin > 0) {
    parts.push(`Cardio ${input.cardioMinutos}/${input.metaCardioMin}min`)
  }

  return parts.join(' · ')
}

function buildReadySubtitle(input: DailyCloseoutInput): string {
  const parts: string[] = []
  const meals = getMealProgress(input)

  if (meals.total > 0 && meals.completed >= meals.total) {
    parts.push('Dieta completa')
  }

  if (input.metaAguaMl > 0 && input.aguaMl >= input.metaAguaMl) {
    parts.push('Hidratação completa')
  }

  if (input.metaCardioMin > 0 && input.cardioMinutos >= input.metaCardioMin) {
    parts.push('Cardio completo')
  }

  if (
    input.isTrainingDay &&
    !input.diaOffManual &&
    input.trainingBriefing.status === 'complete'
  ) {
    parts.push('Treino completo')
  }

  if (parts.length === 0) {
    return 'Execução registrada'
  }

  return parts.join(' · ')
}

export function getDailyCloseoutSummary(
  input: DailyCloseoutInput,
): DailyCloseoutSummary {
  const executionScore = getDailyExecutionScore(input)
  const leaks = getDailyLeaks(input)
  const isReadyToClose = leaks.length === 0
  const evidence = formatCloseoutEvidence(input)
  const primaryLeak = leaks[0] ?? null

  if (isReadyToClose) {
    return {
      date: input.date,
      executionScore,
      isReadyToClose: true,
      title: 'Dia pronto para fechar',
      subtitle: buildReadySubtitle(input),
      evidence,
      leaks,
      primaryLeak: null,
      primaryActionLabel: 'Salvar fechamento',
    }
  }

  return {
    date: input.date,
    executionScore,
    isReadyToClose: false,
    title: 'Fechamento com vazamentos',
    subtitle: primaryLeak
      ? `Principal vazamento: ${primaryLeak.title}`
      : 'Execução incompleta',
    evidence,
    leaks,
    primaryLeak,
    primaryActionLabel: 'Fechar mesmo assim',
  }
}

export function buildHistoricoFromCloseout(
  input: DailyCloseoutInput,
  summary: DailyCloseoutSummary,
  itensPerdidos: string[],
  dayNote?: string,
): HistoricoDia {
  const progress = getTodayProtocolProgress(
    input.periodos,
    input.checks,
    input.refeicaoLivreUsada,
    input.refeicaoLivrePeriodoId,
  )

  return {
    data: input.date,
    completados: progress.completed,
    total: progress.total,
    itensPerdidos,
    executionScore: summary.executionScore,
    closeoutSavedAt: new Date().toISOString(),
    closeoutEvidence: summary.evidence,
    closeoutLeaks: summary.leaks.map((leak) => leak.title),
    dayNote: dayNote?.trim() || undefined,
  }
}

export function collectItensPerdidos(input: DailyCloseoutInput): string[] {
  const perdidos: string[] = []

  for (const periodo of input.periodos) {
    const isRefeicaoLivre =
      input.refeicaoLivreUsada &&
      input.refeicaoLivrePeriodoId === periodo.id
    if (isRefeicaoLivre) continue

    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional && !input.checks[sub.id]?.checked) {
            perdidos.push(sub.nome)
          }
        }
      } else if (!item.opcional && !input.checks[item.id]?.checked) {
        perdidos.push(item.nome)
      }
    }
  }

  return perdidos
}

export function toCloseoutHistorico(
  input: DailyCloseoutInput,
  dayNote?: string,
): HistoricoDia {
  const summary = getDailyCloseoutSummary(input)
  return buildHistoricoFromCloseout(
    input,
    summary,
    collectItensPerdidos(input),
    dayNote,
  )
}
