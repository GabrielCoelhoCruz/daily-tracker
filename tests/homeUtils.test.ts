import { plano } from "@/data/plano"
import { filtrarItensDoDia } from "@/utils/diaUtils"
import {
  getDailyMetricSummaries,
  getNextHomeAction,
  getTodayProtocolProgress,
  getTodayWorkoutSummary,
  isPeriodComplete,
} from "@/utils/homeUtils"
import type { Periodo } from "@/data/plano"

const mondayPeriodos = filtrarItensDoDia(plano.periodos, 1, false)

function makeChecks(ids: string[]): Record<string, { checked: boolean; timestamp: number }> {
  return Object.fromEntries(
    ids.map((id) => [id, { checked: true, timestamp: 1 }])
  )
}

describe("getTodayProtocolProgress", () => {
  it("calculates completed, total, remaining, and percentage for today's filtered protocol", () => {
    const progress = getTodayProtocolProgress(mondayPeriodos, {}, false, null)

    expect(progress.total).toBeGreaterThan(0)
    expect(progress.completed).toBe(0)
    expect(progress.remaining).toBe(progress.total)
    expect(progress.percentage).toBe(0)
  })

  it("counts free-meal period items as completed", () => {
    const jejumIds = mondayPeriodos
      .find((p) => p.id === "jejum")
      ?.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      ) ?? []

    const checks = makeChecks(jejumIds)
    const withoutFree = getTodayProtocolProgress(
      mondayPeriodos,
      checks,
      false,
      null
    )
    const withFree = getTodayProtocolProgress(
      mondayPeriodos,
      checks,
      true,
      "ref1"
    )

    expect(withFree.completed).toBeGreaterThan(withoutFree.completed)
  })
})

describe("isPeriodComplete", () => {
  it("returns true when all checkable items are checked", () => {
    const mockPeriodo: Periodo = {
      id: "test",
      nome: "Test",
      itens: [
        { id: "a", nome: "A", categoria: "suplemento" },
        { id: "b", nome: "B", categoria: "suplemento" },
      ],
    }

    expect(isPeriodComplete(mockPeriodo, makeChecks(["a", "b"]), false, null)).toBe(
      true
    )
    expect(isPeriodComplete(mockPeriodo, makeChecks(["a"]), false, null)).toBe(
      false
    )
  })
})

describe("getNextHomeAction", () => {
  const baseInput = {
    periodos: mondayPeriodos,
    checks: {} as Record<string, { checked: boolean; timestamp: number }>,
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null as string | null,
    aguaMl: 3000,
    metaAguaMl: plano.metaHidratacao.aguaMl,
    cardioMinutos: 90,
    metaCardioMin: plano.metaCardioMin,
    isTrainingDay: true,
    treino: filtrarItensDoDia(plano.periodos, 1, false) as unknown as null,
    workoutLogged: true,
  }

  it("suggests hydration when water is significantly behind", () => {
    const action = getNextHomeAction({
      ...baseInput,
      aguaMl: 500,
      cardioMinutos: 0,
      workoutLogged: false,
    })

    expect(action.type).toBe("hydration")
    expect(action.title).toBe("Hidratação")
  })

  it("suggests the first incomplete meal when diet is in progress", () => {
    const jejum = mondayPeriodos.find((p) => p.id === "jejum")
    const jejumIds =
      jejum?.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      ) ?? []

    const action = getNextHomeAction({
      ...baseInput,
      checks: makeChecks(jejumIds),
      aguaMl: 3500,
      cardioMinutos: 0,
      workoutLogged: false,
    })

    expect(action.type).toBe("meal")
    if (action.type === "meal") {
      expect(action.periodoId).toBe("ref1")
    }
  })

  it("suggests cardio when meals are complete but cardio target is not met", () => {
    const allIds = mondayPeriodos.flatMap((periodo) =>
      periodo.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      )
    )

    const action = getNextHomeAction({
      ...baseInput,
      checks: makeChecks(allIds),
      aguaMl: 4000,
      cardioMinutos: 30,
      workoutLogged: false,
    })

    expect(action.type).toBe("cardio")
  })

  it("suggests workout on training day when workout is available and not logged", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const treino = getTreinoDoDia(1)
    const allIds = mondayPeriodos.flatMap((periodo) =>
      periodo.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      )
    )

    const action = getNextHomeAction({
      ...baseInput,
      checks: makeChecks(allIds),
      aguaMl: 4000,
      cardioMinutos: 90,
      treino,
      workoutLogged: false,
    })

    expect(action.type).toBe("workout")
  })

  it("suggests complete state when protocol, cardio, and workout are done or not applicable", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const allIds = mondayPeriodos.flatMap((periodo) =>
      periodo.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      )
    )

    const action = getNextHomeAction({
      ...baseInput,
      checks: makeChecks(allIds),
      aguaMl: 4000,
      cardioMinutos: 90,
      treino: getTreinoDoDia(1),
      workoutLogged: true,
    })

    expect(action.type).toBe("complete")
  })

  it("suggests continue workout when training briefing is in-progress", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const { getTodayTrainingBriefing } = require("@/utils/todayTrainingUtils")
    const treino = getTreinoDoDia(1)
    const allIds = mondayPeriodos.flatMap((periodo) =>
      periodo.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      )
    )

    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino,
      session: undefined,
    })

    const inProgressBriefing = {
      ...briefing,
      status: "in-progress" as const,
      title: "Treino em andamento",
      subtitle: "8/18 sets concluídos",
      nextActionLabel: "Continuar treino",
      completedSets: 8,
      totalSets: 18,
      currentSetLabel: "Supino inclinado · Set 3",
      statsLabel: "7 exercícios · Peito",
    }

    const action = getNextHomeAction({
      ...baseInput,
      checks: makeChecks(allIds),
      aguaMl: 4000,
      cardioMinutos: 90,
      treino,
      trainingBriefing: inProgressBriefing,
    })

    expect(action.type).toBe("workout")
    expect(action.title).toBe("Treino em andamento")
    expect(action.cta).toBe("Continuar treino")
    expect(action.subtitle).toContain("Set 3")
  })

  describe("closeout-aware final state (hero mirrors DailyCloseoutCard)", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const allIds = mondayPeriodos.flatMap((periodo) =>
      periodo.itens.flatMap((item) =>
        item.subItens?.length ? item.subItens.map((s) => s.id) : [item.id]
      )
    )
    const completeInput = {
      ...baseInput,
      checks: makeChecks(allIds),
      aguaMl: 4000,
      cardioMinutos: 90,
      treino: getTreinoDoDia(1),
      workoutLogged: true,
    }

    it("never shows 'Fechar o dia' before closeoutTime — shows 'Tudo em dia'", () => {
      const action = getNextHomeAction({
        ...completeInput,
        closeout: {
          afterCloseoutTime: false,
          isDayClosed: false,
          isReadyToClose: true,
        },
      })

      expect(action.type).toBe("complete")
      expect(action.title).toBe("Tudo em dia")
      expect(action.cta).not.toBe("Fechar o dia")
    })

    it("shows 'Fechar o dia' only after closeoutTime with complete day", () => {
      const action = getNextHomeAction({
        ...completeInput,
        closeout: {
          afterCloseoutTime: true,
          isDayClosed: false,
          isReadyToClose: true,
        },
      })

      expect(action.type).toBe("closeout")
      expect(action.cta).toBe("Fechar o dia")
    })

    it("shows 'Dia fechado' after the closeout was saved", () => {
      const action = getNextHomeAction({
        ...completeInput,
        closeout: {
          afterCloseoutTime: true,
          isDayClosed: true,
          isReadyToClose: true,
        },
      })

      expect(action.type).toBe("complete")
      expect(action.title).toBe("Dia fechado")
    })
  })
})

describe("getDailyMetricSummaries", () => {
  it("returns water, cardio, diet, and workout summaries with correct values", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const summaries = getDailyMetricSummaries({
      periodos: mondayPeriodos,
      checks: {},
      refeicaoLivreUsada: false,
      refeicaoLivrePeriodoId: null,
      aguaMl: 2250,
      metaAguaMl: 4000,
      cardioMinutos: 30,
      metaCardioMin: 90,
      isTrainingDay: true,
      diaOffManual: false,
      treino: getTreinoDoDia(1),
    })

    expect(summaries).toHaveLength(3)

    const water = summaries.find((s) => s.kind === "water")
    expect(water?.value).toBe("2.25 / 4.0L")

    const cardio = summaries.find((s) => s.kind === "cardio")
    expect(cardio?.value).toBe("30 / 90min")

    const diet = summaries.find((s) => s.kind === "diet")
    expect(diet?.value).toMatch(/\d+ \/ \d+/)
  })

  it("filters metrics by kinds when provided", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const summaries = getDailyMetricSummaries({
      periodos: mondayPeriodos,
      checks: {},
      refeicaoLivreUsada: false,
      refeicaoLivrePeriodoId: null,
      aguaMl: 2250,
      metaAguaMl: 4000,
      cardioMinutos: 30,
      metaCardioMin: 90,
      isTrainingDay: true,
      diaOffManual: false,
      treino: getTreinoDoDia(1),
      kinds: ["diet", "water", "cardio"],
    })

    expect(summaries).toHaveLength(3)
    expect(summaries.map((s) => s.kind)).toEqual(["diet", "water", "cardio"])
  })
})

describe("getTodayWorkoutSummary", () => {
  it("returns training summary on training days", () => {
    const { getTreinoDoDia } = require("@/utils/diaUtils")
    const summary = getTodayWorkoutSummary({
      isTrainingDay: true,
      diaOffManual: false,
      treino: getTreinoDoDia(1),
    })

    expect(summary.kind).toBe("training")
    if (summary.kind === "training") {
      expect(summary.title).toContain("Peito")
      expect(summary.firstExercise).toContain("Supino inclinado")
    }
  })

  it("returns rest summary on rest days", () => {
    const summary = getTodayWorkoutSummary({
      isTrainingDay: false,
      diaOffManual: false,
      treino: null,
    })

    expect(summary.kind).toBe("rest")
  })

  it("returns day off summary when manual day off is active", () => {
    const summary = getTodayWorkoutSummary({
      isTrainingDay: false,
      diaOffManual: true,
      treino: null,
    })

    expect(summary.kind).toBe("dayOff")
  })
})
