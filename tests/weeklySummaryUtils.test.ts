import type { HistoricoDia } from "@/stores/useHistoryStore";
import type { PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import {
  buildWeeklySummaryText,
  getSummaryTitle,
} from "@/utils/weeklySummaryUtils";

// 2026-07-01 é quarta — semana Seg 2026-06-29 → Dom 2026-07-05.
const TODAY = "2026-07-01";

function makeDay(overrides: Partial<HistoricoDia> & { data: string }): HistoricoDia {
  return {
    completados: 5,
    total: 5,
    itensPerdidos: [],
    executionScore: 90,
    closeoutSavedAt: "2026-06-29T21:00:00.000Z",
    closeoutLeaks: [],
    aguaMl: 3000,
    metaAguaMl: 3000,
    cardioMin: 30,
    metaCardioMin: 30,
    treinoAgendado: true,
    treinoConcluido: true,
    ...overrides,
  };
}

function makeCheckIn(
  overrides: Partial<PhysiqueCheckIn> & { id: string; date: string; weight: number },
): PhysiqueCheckIn {
  return {
    week: 1,
    photoPaths: ["a.jpg"],
    mode: "quick",
    ...overrides,
  };
}

describe("getSummaryTitle", () => {
  it("labels by coach presence", () => {
    expect(getSummaryTitle(true)).toBe("Resumo para coach");
    expect(getSummaryTitle(false)).toBe("Resumo da semana");
  });
});

describe("buildWeeklySummaryText", () => {
  it("uses 'não registrado' when there is no data", () => {
    const text = buildWeeklySummaryText({
      dias: {},
      checkIns: [],
      todayDate: TODAY,
      hasCoach: false,
    });

    expect(text).toContain("Resumo ShapeIQ — Semana");
    expect(text).toContain("Execução geral: não registrado");
    expect(text).toContain("Dias fechados: 0/7");
    expect(text).toContain("Peso: não registrado");
    expect(text).toContain("Último check-in: não registrado");
    expect(text).toContain("Nenhum check-in registrado");
  });

  it("aggregates closed days inside the current week", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-29": makeDay({ data: "2026-06-29", executionScore: 80, aguaMl: 2000 }),
      "2026-06-30": makeDay({ data: "2026-06-30", executionScore: 100, aguaMl: 4000 }),
      // Fora da semana — deve ser ignorado.
      "2026-06-20": makeDay({ data: "2026-06-20", executionScore: 10 }),
    };

    const text = buildWeeklySummaryText({
      dias,
      checkIns: [],
      todayDate: TODAY,
      hasCoach: true,
    });

    expect(text).toContain("Execução geral: 90%");
    expect(text).toContain("Dias fechados: 2/7");
    expect(text).toContain("média 3,0L/dia");
    expect(text).toContain("Cardio: 60/60 min na semana");
    expect(text).toContain("Treino: 2/2 sessões");
  });

  it("reports weight delta and check-in freshness", () => {
    const text = buildWeeklySummaryText({
      dias: {},
      checkIns: [
        makeCheckIn({ id: "1", date: "2026-06-10", weight: 82 }),
        makeCheckIn({ id: "2", date: "2026-06-28", weight: 80.5 }),
      ],
      todayDate: TODAY,
      hasCoach: false,
    });

    expect(text).toContain("Peso: 82kg → 80.5kg");
    expect(text).toContain("Último check-in: há 3 dias");
    expect(text).toContain("Check-in de 2026-06-28 com 1 foto");
  });

  it("reflects partial meals without treating them as skipped", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-29": makeDay({ data: "2026-06-29", refeicoesParciais: 1 }),
      "2026-06-30": makeDay({ data: "2026-06-30", refeicoesParciais: 2 }),
    };

    const text = buildWeeklySummaryText({
      dias,
      checkIns: [],
      todayDate: TODAY,
      hasCoach: false,
    });

    expect(text).toContain("(3 refeições parciais)");
    // Aderência ao protocolo não é zerada por refeições parciais.
    expect(text).toContain("Protocolo/refeições: 100%");
  });

  it("ignores auto-reset days without closeoutSavedAt", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-29": makeDay({ data: "2026-06-29" }),
      "2026-06-30": {
        data: "2026-06-30",
        completados: 1,
        total: 5,
        itensPerdidos: ["Almoço"],
        // Sem closeoutSavedAt — rollover automático, não fechado.
      },
    };

    const text = buildWeeklySummaryText({
      dias,
      checkIns: [],
      todayDate: TODAY,
      hasCoach: false,
    });

    expect(text).toContain("Dias fechados: 1/7");
  });

  it("includes user note when provided", () => {
    const text = buildWeeklySummaryText({
      dias: {},
      checkIns: [],
      todayDate: TODAY,
      hasCoach: false,
      userNote: "Semana de viagem, cardio reduzido.",
    });
    expect(text).toContain("Semana de viagem, cardio reduzido.");
  });
});
