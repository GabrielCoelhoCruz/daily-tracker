import { plano } from '@/data/plano'
import { filtrarItensDoDia } from '@/utils/diaUtils'
import { treinos } from '@/data/treinos'
import { buildExerciseSetLogs } from '@/utils/trainingPerformanceUtils'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import type { TodayTrainingBriefing } from '@/utils/todayTrainingUtils'
import {
  buildHistoricoFromCloseout,
  formatCloseoutEvidence,
  getDailyCloseoutSummary,
  getDailyExecutionScore,
  getDailyLeaks,
  getCloseoutReadiness,
  getMealProgress,
  isAfterCloseoutTime,
  parseCloseoutTime,
  toCloseoutHistorico,
} from '@/utils/dailyCloseoutUtils'
import { buildBasePlan } from '@/utils/basePlanUtils'

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
    expect(summary.primaryActionLabel).toBe('Fechar o dia')
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

// ————— closeoutTime —————

const at = (h: number, m = 0) => new Date(2026, 5, 27, h, m)

describe('parseCloseoutTime / isAfterCloseoutTime', () => {
  it('interpreta HH:MM válido e cai para 21:00 em valores inválidos', () => {
    expect(parseCloseoutTime('06:30')).toBe(390)
    expect(parseCloseoutTime('21:00')).toBe(1260)
    expect(parseCloseoutTime('')).toBe(1260)
    expect(parseCloseoutTime('99:99')).toBe(1260)
    expect(parseCloseoutTime(undefined)).toBe(1260)
  })

  it('compara hora local com o horário de fechamento', () => {
    expect(isAfterCloseoutTime('21:00', at(20, 59))).toBe(false)
    expect(isAfterCloseoutTime('21:00', at(21, 0))).toBe(true)
    expect(isAfterCloseoutTime('21:00', at(23, 30))).toBe(true)
  })

  it('trata madrugada (antes do corte lógico de 4h) como após o fechamento', () => {
    expect(isAfterCloseoutTime('21:00', at(1, 30))).toBe(true)
    expect(isAfterCloseoutTime('21:00', at(3, 59))).toBe(true)
    expect(isAfterCloseoutTime('21:00', at(4, 0))).toBe(false)
  })
})

describe('getDailyCloseoutSummary — fases do closeoutTime', () => {
  it('antes do closeoutTime com pendências: Voltar para executar, sem fechar', () => {
    const summary = getDailyCloseoutSummary({
      ...makeBaseInput({ cardioMinutos: 0 }),
      closeoutTime: '21:00',
      now: at(15),
    })

    expect(summary.phase).toBe('before-closeout')
    expect(summary.canClose).toBe(false)
    expect(summary.primaryAction).toBe('go-execute')
    expect(summary.primaryActionLabel).toBe('Voltar para executar')
  })

  it('antes do closeoutTime com tudo completo: Tudo em dia, sem ação de fechamento', () => {
    const summary = getDailyCloseoutSummary({
      ...makeBaseInput(),
      closeoutTime: '21:00',
      now: at(15),
    })

    expect(summary.phase).toBe('before-closeout')
    expect(summary.canClose).toBe(false)
    expect(summary.primaryAction).toBe('none')
    expect(summary.title).toBe('Tudo em dia')
  })

  it('depois do closeoutTime com tudo completo: Fechar o dia', () => {
    const summary = getDailyCloseoutSummary({
      ...makeBaseInput(),
      closeoutTime: '21:00',
      now: at(21, 5),
    })

    expect(summary.phase).toBe('after-closeout')
    expect(summary.canClose).toBe(true)
    expect(summary.primaryAction).toBe('close')
    expect(summary.primaryActionLabel).toBe('Fechar o dia')
  })

  it('depois do closeoutTime com pendências: Fechar mesmo assim', () => {
    const summary = getDailyCloseoutSummary({
      ...makeBaseInput({ cardioMinutos: 0 }),
      closeoutTime: '21:00',
      now: at(22),
    })

    expect(summary.phase).toBe('after-closeout')
    expect(summary.canClose).toBe(true)
    expect(summary.primaryAction).toBe('close-anyway')
    expect(summary.primaryActionLabel).toBe('Fechar mesmo assim')
  })

  it('fechar após o closeoutTime transforma pendências em vazamentos registrados', () => {
    const historico = toCloseoutHistorico({
      ...makeBaseInput({ cardioMinutos: 0 }),
      closeoutTime: '21:00',
      now: at(22),
    })

    expect(historico.closeoutSavedAt).toBeDefined()
    expect(historico.closeoutLeaks?.some((t) => t.includes('Cardio'))).toBe(
      true,
    )
  })

  it('sem closeoutTime mantém o comportamento legado (sempre após o fechamento)', () => {
    const summary = getDailyCloseoutSummary(makeBaseInput())
    expect(summary.canClose).toBe(true)
  })
})

// ————— Parcial (plano-base simples) —————

const simplePlan = buildBasePlan({
  mealNames: ['Café', 'Almoço', 'Jantar'],
  aguaMl: 3000,
  cardioMin: 0,
})

const simpleMealIds = simplePlan.periodos.map((p) => p.itens[0].id)

function makeSimpleInput(
  checks: Record<
    string,
    { checked: boolean; timestamp: number; partial?: boolean }
  >,
) {
  return {
    date: '2026-06-27',
    periodos: simplePlan.periodos,
    checks,
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null,
    aguaMl: 3000,
    metaAguaMl: 3000,
    cardioMinutos: 0,
    metaCardioMin: 0,
    isTrainingDay: false,
    diaOffManual: false,
    trainingBriefing: {
      ...makePartialTrainingBriefing(0, 0),
      status: 'no-training' as const,
    },
    closeoutTime: '21:00',
    now: at(22),
  }
}

describe('estado Parcial de refeição', () => {
  it('Feito = crédito total; tudo feito fecha sem vazamentos', () => {
    const checks = makeChecks(simpleMealIds)
    const meals = getMealProgress(makeSimpleInput(checks))

    expect(meals).toMatchObject({ completed: 3, partial: 0, total: 3, score: 100 })
    expect(getDailyLeaks(makeSimpleInput(checks))).toHaveLength(0)
  })

  it('Parcial = crédito parcial e vazamento leve', () => {
    const checks = {
      ...makeChecks([simpleMealIds[0], simpleMealIds[1]]),
      [simpleMealIds[2]]: { checked: true, partial: true, timestamp: 1 },
    }
    const input = makeSimpleInput(checks)
    const meals = getMealProgress(input)

    expect(meals).toMatchObject({ completed: 2, partial: 1, total: 3 })
    expect(meals.score).toBe(83) // (2 + 0.5) / 3

    const leaks = getDailyLeaks(input)
    const partialLeak = leaks.find((l) => l.title.includes('parcial'))
    expect(partialLeak).toBeDefined()
    expect(partialLeak?.severity).toBe('low')
    // Parcial não conta como refeição incompleta (não é pulada)
    expect(leaks.some((l) => l.title.includes('incompleta'))).toBe(false)
  })

  it('Pendente após o fechamento vira vazamento de refeição incompleta', () => {
    const checks = makeChecks([simpleMealIds[0]])
    const leaks = getDailyLeaks(makeSimpleInput(checks))

    expect(
      leaks.some((l) => l.type === 'meal' && l.title.includes('incompletas')),
    ).toBe(true)
  })

  it('fechamento mostra refeições parciais na evidência e no histórico', () => {
    const checks = {
      ...makeChecks([simpleMealIds[0], simpleMealIds[1]]),
      [simpleMealIds[2]]: { checked: true, partial: true, timestamp: 1 },
    }
    const input = makeSimpleInput(checks)

    expect(formatCloseoutEvidence(input)).toContain('(1 parcial)')

    const historico = toCloseoutHistorico(input)
    expect(historico.refeicoesParciais).toBe(1)
  })
})

// ————— Snapshot histórico imutável —————

describe('snapshot histórico após edição do plano', () => {
  it('dia fechado com 5 refeições continua correto após o plano virar 6 refeições', () => {
    const plan5 = buildBasePlan({
      mealNames: ['R1', 'R2', 'R3', 'R4', 'R5'],
      aguaMl: 3000,
      cardioMin: 0,
    })
    const ids5 = plan5.periodos.map((p) => p.itens[0].id)
    const input5 = {
      ...makeSimpleInput(makeChecks(ids5)),
      periodos: plan5.periodos,
    }

    const summary = getDailyCloseoutSummary(input5)
    const historico = buildHistoricoFromCloseout(input5, summary, [])

    expect(historico.total).toBe(5)
    expect(historico.completados).toBe(5)
    expect(historico.executionScore).toBe(100)

    // "Edita" o plano para 6 refeições — o histórico salvo não referencia o plano.
    const frozen = JSON.parse(JSON.stringify(historico))
    buildBasePlan({
      mealNames: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
      aguaMl: 3000,
      cardioMin: 0,
    })

    expect(historico).toEqual(frozen)
    expect(historico.total).toBe(5)
  })
})
