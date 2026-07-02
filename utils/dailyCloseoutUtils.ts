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

export type CloseoutPhase = 'before-closeout' | 'after-closeout'

export type CloseoutPrimaryAction =
  | 'close'
  | 'close-anyway'
  | 'go-execute'
  | 'none'

export type DailyCloseoutSummary = {
  date: string
  executionScore: number
  isReadyToClose: boolean
  /** Fase relativa ao closeoutTime do plano ativo. */
  phase: CloseoutPhase
  /** Fechamento só é permitido depois do closeoutTime. */
  canClose: boolean
  primaryAction: CloseoutPrimaryAction
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
  partial?: boolean
  skipped?: boolean
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
  /**
   * Horário de fechamento do plano ativo (HH:MM). Quando ausente,
   * o dia é tratado como após o fechamento (comportamento legado).
   */
  closeoutTime?: string
  /** Hora local do dispositivo — injetável em testes. */
  now?: Date
}

const DEFAULT_CLOSEOUT_TIME = '21:00'
/** Corte do dia lógico (4h) — depois da meia-noite ainda é "após o fechamento" de ontem. */
const LOGICAL_DAY_CUTOFF_HOUR = 4

export function parseCloseoutTime(value: string | undefined): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value?.trim() ?? '')
  if (!match) return parseCloseoutTime(DEFAULT_CLOSEOUT_TIME)
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) {
    return parseCloseoutTime(DEFAULT_CLOSEOUT_TIME)
  }
  return hours * 60 + minutes
}

export function isAfterCloseoutTime(
  closeoutTime: string | undefined,
  now: Date,
): boolean {
  const closeoutMinutes = parseCloseoutTime(closeoutTime)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Entre 00:00 e o corte lógico (4h) o dia lógico ainda é o anterior,
  // portanto já passamos do fechamento daquele dia.
  if (now.getHours() < LOGICAL_DAY_CUTOFF_HOUR) return true

  return nowMinutes >= closeoutMinutes
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

/** Crédito de refeição parcial (Parcial = metade do crédito de Feito). */
const PARTIAL_MEAL_CREDIT = 0.5

function isPeriodPartial(
  periodo: Periodo,
  checks: Record<string, CheckState>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null,
): boolean {
  if (refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id) {
    return false
  }
  const hasPartial = (id: string) =>
    Boolean(checks[id]?.checked && checks[id]?.partial)

  for (const item of periodo.itens) {
    if (item.subItens && item.subItens.length > 0) {
      if (item.subItens.some((sub) => hasPartial(sub.id))) return true
    } else if (hasPartial(item.id)) {
      return true
    }
  }
  return false
}

export function getMealProgress(input: Pick<
  DailyCloseoutInput,
  'periodos' | 'checks' | 'refeicaoLivreUsada' | 'refeicaoLivrePeriodoId'
>): { completed: number; partial: number; total: number; score: number } {
  const mealPeriods = input.periodos.filter(isMealPeriod)

  let completed = 0
  let partial = 0

  for (const periodo of mealPeriods) {
    const resolved = isPeriodComplete(
      periodo,
      input.checks,
      input.refeicaoLivreUsada,
      input.refeicaoLivrePeriodoId,
    )
    if (!resolved) continue

    if (
      isPeriodPartial(
        periodo,
        input.checks,
        input.refeicaoLivreUsada,
        input.refeicaoLivrePeriodoId,
      )
    ) {
      partial++
    } else {
      completed++
    }
  }

  const creditScore =
    mealPeriods.length > 0
      ? clampPercent(
          ((completed + partial * PARTIAL_MEAL_CREDIT) / mealPeriods.length) *
            100,
        )
      : 100

  return {
    completed,
    partial,
    total: mealPeriods.length,
    score: creditScore,
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
  const resolvedMeals = meals.completed + meals.partial

  if (meals.total > 0 && resolvedMeals < meals.total) {
    const pending = meals.total - resolvedMeals
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

  if (meals.partial > 0) {
    leaks.push({
      type: 'meal',
      title:
        meals.partial === 1
          ? '1 refeição parcial'
          : `${meals.partial} refeições parciais`,
      evidence: `${meals.partial} refeição${meals.partial === 1 ? '' : 'es'} marcada${meals.partial === 1 ? '' : 's'} como parcial`,
      severity: 'low',
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
    const partialSuffix =
      meals.partial > 0
        ? ` (${meals.partial} parcial${meals.partial === 1 ? '' : 'is'})`
        : ''
    parts.push(`Refeições ${meals.completed}/${meals.total}${partialSuffix}`)
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

  const afterCloseout =
    input.closeoutTime === undefined ||
    isAfterCloseoutTime(input.closeoutTime, input.now ?? new Date())
  const phase: CloseoutPhase = afterCloseout
    ? 'after-closeout'
    : 'before-closeout'

  const base = {
    date: input.date,
    executionScore,
    isReadyToClose,
    phase,
    evidence,
    leaks,
    primaryLeak: isReadyToClose ? null : primaryLeak,
  }

  // Antes do closeoutTime não é possível fechar o dia:
  // pendências mandam o atleta de volta à execução, dia completo vira "Tudo em dia".
  if (!afterCloseout) {
    if (isReadyToClose) {
      return {
        ...base,
        canClose: false,
        primaryAction: 'none',
        title: 'Tudo em dia',
        subtitle: buildReadySubtitle(input),
        primaryActionLabel: 'Tudo em dia',
      }
    }
    return {
      ...base,
      canClose: false,
      primaryAction: 'go-execute',
      title: 'Dia em execução',
      subtitle: primaryLeak
        ? `Pendente: ${primaryLeak.title}`
        : 'Execução incompleta',
      primaryActionLabel: 'Voltar para executar',
    }
  }

  if (isReadyToClose) {
    return {
      ...base,
      canClose: true,
      primaryAction: 'close',
      title: 'Dia pronto para fechar',
      subtitle: buildReadySubtitle(input),
      primaryActionLabel: 'Fechar o dia',
    }
  }

  return {
    ...base,
    canClose: true,
    primaryAction: 'close-anyway',
    title: 'Fechamento com vazamentos',
    subtitle: primaryLeak
      ? `Principal vazamento: ${primaryLeak.title}`
      : 'Execução incompleta',
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
  const meals = getMealProgress(input)

  return {
    data: input.date,
    completados: progress.completed,
    total: progress.total,
    itensPerdidos,
    refeicoesParciais: meals.partial > 0 ? meals.partial : undefined,
    executionScore: summary.executionScore,
    closeoutSavedAt: new Date().toISOString(),
    closeoutEvidence: summary.evidence,
    closeoutLeaks: summary.leaks.map((leak) => leak.title),
    dayNote: dayNote?.trim() || undefined,
    aguaMl: input.aguaMl,
    metaAguaMl: input.metaAguaMl,
    cardioMin: input.cardioMinutos,
    metaCardioMin: input.metaCardioMin,
    treinoAgendado: input.isTrainingDay && !input.diaOffManual,
    treinoConcluido: input.trainingBriefing.status === 'complete',
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
