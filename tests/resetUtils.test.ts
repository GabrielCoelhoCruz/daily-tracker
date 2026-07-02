jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
)

import { checkAndReset } from "@/utils/resetUtils"
import { useDayStore } from "@/stores/useDayStore"
import { useHistoryStore } from "@/stores/useHistoryStore"
import { getLogicalDate } from "@/utils/dateUtils"

const YESTERDAY = "2026-06-30"

function setupDay(overrides: Partial<ReturnType<typeof useDayStore.getState>>) {
  useDayStore.setState({
    checks: {},
    diaOffManual: false,
    treinoHojeId: null,
    aguaMl: 0,
    chaMl: 0,
    sessoesCardio: [],
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null,
    semanaRefeicaoLivre: "2026-W27",
    ultimoReset: YESTERDAY,
    ...overrides,
  })
}

describe("checkAndReset (midnight rollover)", () => {
  beforeEach(() => {
    useHistoryStore.setState({ dias: {} })
  })

  it("does nothing when the logical day has not changed", () => {
    setupDay({ ultimoReset: getLogicalDate(new Date()) })
    checkAndReset()
    expect(useHistoryStore.getState().dias).toEqual({})
  })

  it("never overwrites an explicit closeout saved for the previous day", () => {
    setupDay({})
    useHistoryStore.getState().salvarDia({
      data: YESTERDAY,
      completados: 10,
      total: 12,
      itensPerdidos: [],
      executionScore: 88,
      closeoutSavedAt: "2026-06-30T22:00:00.000Z",
    })

    checkAndReset()

    const entry = useHistoryStore.getState().dias[YESTERDAY]
    expect(entry.closeoutSavedAt).toBe("2026-06-30T22:00:00.000Z")
    expect(entry.executionScore).toBe(88)
    expect(entry.autoRollover).toBeUndefined()
    // Day state was still reset for the new day
    expect(useDayStore.getState().ultimoReset).toBe(getLogicalDate(new Date()))
  })

  it("skips creating history for untouched days (no execution)", () => {
    setupDay({ checks: {} })
    checkAndReset()
    expect(useHistoryStore.getState().dias[YESTERDAY]).toBeUndefined()
    expect(useDayStore.getState().ultimoReset).toBe(getLogicalDate(new Date()))
  })

  it("marks rollover entries as autoRollover without closeoutSavedAt", () => {
    // Check one real item from the active plan so completados > 0
    const { getActivePlano } = require("@/stores/useProtocolStore")
    const { filtrarItensDoDia } = require("@/utils/diaUtils")
    const dayOfWeek = new Date(YESTERDAY + "T12:00:00").getDay()
    const periodos = filtrarItensDoDia(
      getActivePlano().periodos,
      dayOfWeek,
      false
    )
    const firstItem = periodos[0]?.itens[0]
    const firstId = firstItem?.subItens?.length
      ? firstItem.subItens[0].id
      : firstItem?.id

    setupDay({
      checks: { [firstId as string]: { checked: true, timestamp: 1 } },
    })

    checkAndReset()

    const entry = useHistoryStore.getState().dias[YESTERDAY]
    expect(entry).toBeDefined()
    expect(entry.autoRollover).toBe(true)
    expect(entry.closeoutSavedAt).toBeUndefined()
    expect(entry.completados).toBeGreaterThan(0)
  })
})
