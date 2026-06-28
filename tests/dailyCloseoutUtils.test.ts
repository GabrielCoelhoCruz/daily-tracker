import { plano } from '@/data/plano'
import { filtrarItensDoDia } from '@/utils/diaUtils'
import { treinos } from '@/data/treinos'
import { buildExerciseSetLogs } from '@/utils/trainingPerformanceUtils'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import type { TodayTrainingBriefing } from '@/utils/todayTrainingUtils'
import {
  formatCloseoutEvidence,
  getDailyCloseoutSummary,
  getDailyExecutionScore,
  getDailyLeaks,
  getCloseoutReadiness,
} from '@/utils/dailyCloseoutUtils'

const treinoA = treinos[0]
const mondayPeriodos = filtrarItensDoDia(plano.periodos, 1, false)

function makeChecks(ids: string[]) {
  return Object.fromEntries(
    ids.map((id) => [id, { checked: true, timestamp: 1 }]),
  )
}

function allMealPeriodIds(): string[] {
  const checks: Record<string, { checked: boolean; timestamp: number }> = {}
  for (const periodo of mondayPeriodos) {
    if (!periodo.itens.some((item) => item.categoria === 'refeicao')) continue
    for (const item of periodo.itens) {
      if (item.subItens?.length) {
        for (const sub of item.subItens) {
          if (!sub.opcional) checks[sub.id] = { checked: true, timestamp: 1 }
        }
      } else if (!item.opcional) {
        checks[item.id] = { checked: true, timestamp: 1 }
      }
    }
  }
  return Object.keys(checks)
}

function makeCompleteTrainingBriefing(): TodayTrainingBriefing {
  const totalSets = treinoA.exercicios.reduce(
    (sum, ex) => sum + buildExerciseSetLogs(ex).length,
    0,
  )

  return {
    status: 'complete',
    title: 'Treino completo',
    subtitle: `${totalSets}/${totalSets} sets`,
    nextActionLabel: 'Revisar treino',
    completedSets: totalSets,
    totalSets,
    volumeKg: 8420,
    currentExerciseName: null,
    currentSetLabel: null,
    isLeak: false,
    workoutLabel: 'Treino A · Peito',
  }
}

function makePartialTrainingBriefing(
  completedSets: number,
  totalSets: number,
): TodayTrainingBriefing {
  return {
    status: 'in-progress',
    title: 'Treino em andamento',
    subtitle: `${completedSets}/${totalSets} sets concluídos`,
    nextActionLabel: 'Continuar treino',
    completedSets,
    totalSets,
    volumeKg: 5420,
    currentExerciseName: 'Supino inclinado máquina/hammer',
    currentSetLabel: 'Supino inclinado máquina/hammer · Set 3',
    isLeak: false,
    workoutLabel: 'Treino A · Peito',
  }
}

function makeBaseInput(
  overrides: Partial<{
    checks: ReturnType<typeof makeChecks>
    aguaMl: number
    cardioMinutos: number
    trainingBriefing: TodayTrainingBriefing
  }> = {},
) {
  const allIds = mondayPeriodos.flatMap((periodo) =>
    periodo.itens.flatMap((item) =>
      item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id],
    ),
  )

  return {
    date: '2026-06-27',
    periodos: mondayPeriodos,
    checks: overrides.checks ?? makeChecks(allIds),
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null,
    aguaMl: overrides.aguaMl ?? plano.metaHidratacao.aguaMl,
    metaAguaMl: plano.metaHidratacao.aguaMl,
    cardioMinutos: overrides.cardioMinutos ?? plano.metaCardioMin,
    metaCardioMin: plano.metaCardioMin,
    isTrainingDay: true,
    diaOffManual: false,
    trainingBriefing: overrides.trainingBriefing ?? makeCompleteTrainingBriefing(),
  }
}

describe('getDailyExecutionScore', () => {
  it('gera score 100 quando dieta, água, cardio e treino estão completos', () => {
    const score = getDailyExecutionScore(makeBaseInput())
    expect(score).toBe(100)
    expect(getCloseoutReadiness(makeBaseInput())).toBe(true)
  })
})

describe('getDailyLeaks — cardio', () => {
  it('detecta cardio pendente como vazamento', () => {
    const input = makeBaseInput({ cardioMinutos: 25 })
    const leaks = getDailyLeaks(input)

    expect(leaks.some((leak) => leak.type === 'cardio')).toBe(true)
    expect(leaks.find((leak) => leak.type === 'cardio')?.title).toContain('65min')
    expect(getDailyExecutionScore(input)).toBeLessThan(100)
  })
})

describe('getDailyLeaks — training', () => {
  it('detecta treino parcial como vazamento usando sets concluídos vs total', () => {
    const input = makeBaseInput({
      trainingBriefing: makePartialTrainingBriefing(12, 18),
    })
    const leaks = getDailyLeaks(input)
    const trainingLeak = leaks.find((leak) => leak.type === 'training')

    expect(trainingLeak).toBeDefined()
    expect(trainingLeak?.title).toBe('Vazamento no treino')
    expect(trainingLeak?.evidence).toBe('12/18 sets registrados')
    expect(getCloseoutReadiness(input)).toBe(false)
  })

  it('detecta treino pendente como vazamento', () => {
    const input = makeBaseInput({
      trainingBriefing: {
        ...makePartialTrainingBriefing(0, 0),
        status: 'pending',
        title: 'Treino pendente',
        completedSets: 0,
        totalSets: 0,
      },
    })

    const leaks = getDailyLeaks(input)
    expect(leaks.some((leak) => leak.title === 'Treino pendente')).toBe(true)
  })
})

describe('formatCloseoutEvidence', () => {
  it('gera evidence string com refeições, água, cardio e treino', () => {
    const evidence = formatCloseoutEvidence(makeBaseInput())

    expect(evidence).toContain('Treino')
    expect(evidence).toContain('sets')
    expect(evidence).toContain('Água')
    expect(evidence).toContain('Refeições')
    expect(evidence).toContain('Cardio')
  })
})

describe('getDailyCloseoutSummary', () => {
  it('retorna título de dia pronto quando não há vazamentos', () => {
    const summary = getDailyCloseoutSummary(makeBaseInput())

    expect(summary.executionScore).toBe(100)
    expect(summary.isReadyToClose).toBe(true)
    expect(summary.title).toBe('Dia pronto para fechar')
    expect(summary.primaryActionLabel).toBe('Salvar fechamento')
    expect(summary.leaks).toHaveLength(0)
  })

  it('retorna fechamento com vazamentos quando há pendências', () => {
    const summary = getDailyCloseoutSummary(
      makeBaseInput({ cardioMinutos: 25 }),
    )

    expect(summary.isReadyToClose).toBe(false)
    expect(summary.title).toBe('Fechamento com vazamentos')
    expect(summary.primaryActionLabel).toBe('Fechar mesmo assim')
    expect(summary.primaryLeak?.type).toBe('cardio')
  })

  it('detecta refeição incompleta como vazamento', () => {
    const mealIds = allMealPeriodIds()
    const partialChecks = makeChecks(
      mondayPeriodos
        .flatMap((periodo) =>
          periodo.itens.flatMap((item) =>
            item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id],
          ),
        )
        .filter((id) => !mealIds.includes(id)),
    )

    const summary = getDailyCloseoutSummary(
      makeBaseInput({ checks: partialChecks }),
    )

    expect(summary.leaks.some((leak) => leak.type === 'meal')).toBe(true)
  })
})
