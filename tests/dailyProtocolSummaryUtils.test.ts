import { plano } from '@/data/plano'
import { filtrarItensDoDia } from '@/utils/diaUtils'
import {
  formatProtocolEvidenceLine,
  getDailyProtocolSummary,
  getNextProtocolPending,
  getProtocolCardioSummary,
  getProtocolHydrationSummary,
  getProtocolMealsSummary,
  isProtocolComplete,
} from '@/utils/dailyProtocolSummaryUtils'

const mondayPeriodos = filtrarItensDoDia(plano.periodos, 1, false)

function makeChecks(ids: string[]) {
  return Object.fromEntries(
    ids.map((id) => [id, { checked: true, timestamp: 1 }]),
  )
}

function allProtocolItemIds() {
  return mondayPeriodos.flatMap((periodo) =>
    periodo.itens.flatMap((item) =>
      item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id],
    ),
  )
}

function makeBaseInput(
  overrides: Partial<{
    checks: ReturnType<typeof makeChecks>
    aguaMl: number
    cardioMinutos: number
    diaOffManual: boolean
  }> = {},
) {
  return {
    periodos: mondayPeriodos,
    checks: overrides.checks ?? makeChecks(allProtocolItemIds()),
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null,
    aguaMl: overrides.aguaMl ?? plano.metaHidratacao.aguaMl,
    metaAguaMl: plano.metaHidratacao.aguaMl,
    cardioMinutos: overrides.cardioMinutos ?? plano.metaCardioMin,
    metaCardioMin: plano.metaCardioMin,
    diaOffManual: overrides.diaOffManual ?? false,
  }
}

describe('getProtocolMealsSummary', () => {
  it('gera resumo com refeições completas e totais', () => {
    const summary = getProtocolMealsSummary(makeBaseInput())

    expect(summary.total).toBeGreaterThan(0)
    expect(summary.completed).toBe(summary.total)
    expect(summary.label).toContain(`${summary.completed}/${summary.total}`)
  })
})

describe('hydration and cardio summaries', () => {
  it('gera resumo de água e cardio', () => {
    const input = makeBaseInput({ aguaMl: 3100, cardioMinutos: 25 })

    expect(getProtocolHydrationSummary(input.aguaMl, input.metaAguaMl)).toBe(
      '3.1L/4.0L',
    )
    expect(getProtocolCardioSummary(input.cardioMinutos, input.metaCardioMin)).toBe(
      '25/90min',
    )
  })
})

describe('getNextProtocolPending', () => {
  it('detecta próxima pendência do protocolo', () => {
    const mealPeriod = mondayPeriodos.find((periodo) =>
      periodo.itens.some((item) => item.categoria === 'refeicao'),
    )
    expect(mealPeriod).toBeDefined()

    const mealItemIds = mealPeriod!.itens.flatMap((item) =>
      item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id],
    )
    const checksWithoutMeal = makeChecks(
      allProtocolItemIds().filter((id) => !mealItemIds.includes(id)),
    )

    const pending = getNextProtocolPending(
      makeBaseInput({ checks: checksWithoutMeal }),
    )

    expect(pending).toBe(mealPeriod!.nome)
  })

  it('retorna hidratação pendente quando refeições estão completas', () => {
    const pending = getNextProtocolPending(
      makeBaseInput({ aguaMl: 1000 }),
    )

    expect(pending).toBe('Hidratação pendente')
  })
})

describe('isProtocolComplete', () => {
  it('retorna complete quando refeições, água e cardio estão completos', () => {
    expect(isProtocolComplete(makeBaseInput())).toBe(true)

    const summary = getDailyProtocolSummary(makeBaseInput())
    expect(summary.status).toBe('complete')
    expect(summary.title).toBe('Protocolo completo')
    expect(summary.nextPendingLabel).toBeNull()
  })

  it('retorna leak quando cardio está muito atrasado', () => {
    const summary = getDailyProtocolSummary(
      makeBaseInput({ cardioMinutos: 25 }),
    )

    expect(summary.status).toBe('leak')
    expect(summary.nextPendingLabel).toBe('Cardio pendente')
  })

  it('retorna pending quando cardio está incompleto mas acima de 50%', () => {
    const summary = getDailyProtocolSummary(
      makeBaseInput({ cardioMinutos: 60 }),
    )

    expect(summary.status).toBe('pending')
    expect(summary.nextPendingLabel).toBe('Cardio pendente')
  })

  it('retorna day-off quando dia off manual está ativo', () => {
    const summary = getDailyProtocolSummary(
      makeBaseInput({ diaOffManual: true }),
    )

    expect(summary.status).toBe('day-off')
    expect(summary.title).toBe('Protocolo pausado')
  })
})

describe('formatProtocolEvidenceLine', () => {
  it('monta linha de evidência compacta', () => {
    const evidence = formatProtocolEvidenceLine(makeBaseInput())

    expect(evidence).toContain('Refeições')
    expect(evidence).toContain('Água')
    expect(evidence).toContain('Cardio')
  })
})
