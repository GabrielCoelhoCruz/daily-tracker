import type { HistoricoDia } from "@/stores/useHistoryStore";
import {
  getPrepReviewSummary,
  getTopMissedPatterns,
  getPrimaryPrepInsight,
  getRecentDaySummaries,
  getCalendarDayTone,
  getBestAndWeakestDays,
  getWeeklyExecutionReview,
  getMainWeeklyLeak,
  getExecutionScoreTone,
  getDayLeakSummary,
  getRecentCloseoutDays,
  getCalendarDayExecutionState,
} from "@/utils/prepReviewUtils";

function makeDia(
  data: string,
  completados: number,
  total: number,
  itensPerdidos: string[] = [],
  closeout?: Partial<
    Pick<
      HistoricoDia,
      | "executionScore"
      | "closeoutSavedAt"
      | "closeoutEvidence"
      | "closeoutLeaks"
      | "dayNote"
    >
  >,
): HistoricoDia {
  return { data, completados, total, itensPerdidos, ...closeout };
}

describe("getPrepReviewSummary", () => {
  const todayDate = "2026-06-27"; // Saturday

  it("calculates weekly adherence from logged days only", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10),
      "2026-06-25": makeDia("2026-06-25", 9, 10),
      "2026-06-27": makeDia("2026-06-27", 7, 10),
    };

    const summary = getPrepReviewSummary(dias, todayDate);

    expect(summary.weeklyAdherence).toBe(80);
    expect(summary.loggedDaysThisWeek).toBe(3);
  });

  it("does not count missing days as failures", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-27": makeDia("2026-06-27", 10, 10),
    };

    const summary = getPrepReviewSummary(dias, todayDate);

    expect(summary.weeklyAdherence).toBe(100);
    expect(summary.loggedDaysThisWeek).toBe(1);
  });

  it("counts strong, weak, and perfect days", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 10, 10),
      "2026-06-24": makeDia("2026-06-24", 9, 10),
      "2026-06-25": makeDia("2026-06-25", 8, 10),
      "2026-06-26": makeDia("2026-06-26", 5, 10),
      "2026-06-27": makeDia("2026-06-27", 3, 10),
    };

    const summary = getPrepReviewSummary(dias, todayDate);

    expect(summary.perfectDaysThisWeek).toBe(1);
    expect(summary.strongDaysThisWeek).toBe(2);
    expect(summary.weakDaysThisWeek).toBe(2);
  });

  it("returns null adherence when no weekly data exists", () => {
    const summary = getPrepReviewSummary({}, todayDate);

    expect(summary.weeklyAdherence).toBeNull();
    expect(summary.monthlyAdherence).toBeNull();
    expect(summary.loggedDaysThisWeek).toBe(0);
  });
});

describe("getTopMissedPatterns and getPrimaryPrepInsight", () => {
  it("returns neutral insight when there is not enough history", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-26": makeDia("2026-06-26", 8, 10, ["Cardio"]),
    };

    const insight = getPrimaryPrepInsight(dias);

    expect(insight.tone).toBe("neutral");
    expect(insight.title).toBe("Continue registrando");
  });

  it("returns warning insight for the most missed item", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10, ["Cardio"]),
      "2026-06-24": makeDia("2026-06-24", 7, 10, ["Cardio"]),
      "2026-06-25": makeDia("2026-06-25", 9, 10, ["Cardio"]),
      "2026-06-26": makeDia("2026-06-26", 8, 10, []),
      "2026-06-27": makeDia("2026-06-27", 9, 10, ["Treino"]),
    };

    const patterns = getTopMissedPatterns(dias);
    const insight = getPrimaryPrepInsight(dias);

    expect(patterns[0]?.name).toBe("Cardio");
    expect(patterns[0]?.missedCount).toBe(3);
    expect(insight.tone).toBe("warning");
    expect(insight.title).toContain("Cardio");
    expect(insight.message).toContain("3 de 5");
  });

  it("returns good insight when there are no repeated misses", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 10, 10, []),
      "2026-06-24": makeDia("2026-06-24", 10, 10, []),
      "2026-06-25": makeDia("2026-06-25", 9, 10, ["Cardio"]),
      "2026-06-26": makeDia("2026-06-26", 10, 10, []),
    };

    const insight = getPrimaryPrepInsight(dias);

    expect(insight.tone).toBe("good");
    expect(insight.title).toBe("Consistência forte");
  });
});

describe("getRecentDaySummaries", () => {
  const todayDate = "2026-06-27";

  it("returns recent logged days sorted newest first", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10),
      "2026-06-25": makeDia("2026-06-25", 9, 10),
      "2026-06-27": makeDia("2026-06-27", 5, 10),
    };

    const summaries = getRecentDaySummaries(dias, todayDate);

    expect(summaries.map((s) => s.date)).toEqual([
      "2026-06-27",
      "2026-06-25",
      "2026-06-23",
    ]);
  });

  it("assigns execution tones for legacy days without closeout", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 10, 10),
      "2026-06-24": makeDia("2026-06-24", 9, 10),
      "2026-06-25": makeDia("2026-06-25", 7, 10),
      "2026-06-26": makeDia("2026-06-26", 3, 10),
      "2026-06-27": makeDia("2026-06-27", 0, 0),
    };

    const summaries = getRecentDaySummaries(dias, todayDate);
    const byDate = Object.fromEntries(summaries.map((s) => [s.date, s]));

    expect(byDate["2026-06-23"]?.tone).toBe("complete");
    expect(byDate["2026-06-24"]?.tone).toBe("complete");
    expect(byDate["2026-06-25"]?.tone).toBe("warning");
    expect(byDate["2026-06-26"]?.tone).toBe("leak");
    expect(byDate["2026-06-27"]?.tone).toBe("empty");
  });

  it("respects the limit", () => {
    const dias: Record<string, HistoricoDia> = {};
    for (let i = 1; i <= 10; i++) {
      const day = String(i).padStart(2, "0");
      dias[`2026-06-${day}`] = makeDia(`2026-06-${day}`, 8, 10);
    }

    const summaries = getRecentDaySummaries(dias, "2026-06-27", 5);

    expect(summaries).toHaveLength(5);
    expect(summaries[0]?.date).toBe("2026-06-10");
  });

  it("marks today as in progress when incomplete", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-27": makeDia("2026-06-27", 5, 10),
    };

    const summaries = getRecentDaySummaries(dias, todayDate);

    expect(summaries[0]?.label).toBe("Hoje");
    expect(summaries[0]?.inProgress).toBe(true);
  });
});

describe("getCalendarDayTone", () => {
  const todayDate = "2026-06-27";

  it("returns future for future dates", () => {
    expect(getCalendarDayTone("2026-06-28", todayDate, null)).toBe("future");
  });

  it("returns no-data for past dates with no history", () => {
    expect(getCalendarDayTone("2026-06-20", todayDate, null)).toBe("no-data");
  });

  it("returns today for current date with no history", () => {
    expect(getCalendarDayTone(todayDate, todayDate, null)).toBe("today");
  });

  it("returns perfect, strong, partial, and weak based on adherence for legacy days", () => {
    expect(
      getCalendarDayTone("2026-06-23", todayDate, makeDia("2026-06-23", 10, 10))
    ).toBe("perfect");
    expect(
      getCalendarDayTone("2026-06-24", todayDate, makeDia("2026-06-24", 9, 10))
    ).toBe("strong");
    expect(
      getCalendarDayTone("2026-06-25", todayDate, makeDia("2026-06-25", 6, 10))
    ).toBe("partial");
    expect(
      getCalendarDayTone("2026-06-26", todayDate, makeDia("2026-06-26", 4, 10))
    ).toBe("weak");
  });

  it("uses executionScore when closeout exists", () => {
    expect(
      getCalendarDayTone(
        "2026-06-23",
        todayDate,
        makeDia("2026-06-23", 8, 10, [], {
          executionScore: 82,
          closeoutSavedAt: "2026-06-23T22:00:00.000Z",
        }),
      ),
    ).toBe("strong");
  });
});

describe("getWeeklyExecutionReview", () => {
  const todayDate = "2026-06-27";

  it("calcula averageScore usando apenas dias com executionScore", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10, [], {
        executionScore: 80,
        closeoutSavedAt: "2026-06-23T22:00:00.000Z",
      }),
      "2026-06-24": makeDia("2026-06-24", 9, 10, [], {
        executionScore: 90,
        closeoutSavedAt: "2026-06-24T22:00:00.000Z",
      }),
      "2026-06-25": makeDia("2026-06-25", 7, 10),
    };

    const review = getWeeklyExecutionReview(dias, todayDate);

    expect(review.averageScore).toBe(85);
    expect(review.closedDays).toBe(2);
    expect(review.bestDay?.score).toBe(90);
  });
});

describe("getMainWeeklyLeak", () => {
  const todayDate = "2026-06-27";

  it("detecta mainLeak mais frequente nos últimos 7 dias", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10, [], {
        closeoutSavedAt: "2026-06-23T22:00:00.000Z",
        closeoutLeaks: ["Cardio 65min abaixo"],
      }),
      "2026-06-24": makeDia("2026-06-24", 7, 10, [], {
        closeoutSavedAt: "2026-06-24T22:00:00.000Z",
        closeoutLeaks: ["Cardio 40min abaixo"],
      }),
      "2026-06-25": makeDia("2026-06-25", 9, 10, [], {
        closeoutSavedAt: "2026-06-25T22:00:00.000Z",
        closeoutLeaks: ["Cardio 20min abaixo"],
      }),
      "2026-06-26": makeDia("2026-06-26", 8, 10, [], {
        closeoutSavedAt: "2026-06-26T22:00:00.000Z",
        closeoutLeaks: ["Treino pendente"],
      }),
    };

    const mainLeak = getMainWeeklyLeak(dias, todayDate);

    expect(mainLeak?.type).toBe("cardio");
    expect(mainLeak?.count).toBe(3);
    expect(mainLeak?.title).toContain("Cardio incompleto");
    expect(mainLeak?.evidence).toContain("3 fechamentos");
  });
});

describe("getExecutionScoreTone", () => {
  it("retorna execution tone correto por score", () => {
    expect(getExecutionScoreTone(95)).toBe("complete");
    expect(getExecutionScoreTone(82)).toBe("strong");
    expect(getExecutionScoreTone(60)).toBe("warning");
    expect(getExecutionScoreTone(40)).toBe("leak");
    expect(getExecutionScoreTone(null)).toBe("empty");
  });
});

describe("getDayLeakSummary", () => {
  it("gera resumo de dia com vazamento principal e evidência", () => {
    const summary = getDayLeakSummary(
      makeDia("2026-06-23", 8, 10, [], {
        executionScore: 72,
        closeoutSavedAt: "2026-06-23T22:00:00.000Z",
        closeoutEvidence: "Treino 12/18 sets · Água 3.1/4.0L",
        closeoutLeaks: ["Cardio 65min abaixo", "Treino pendente"],
      }),
    );

    expect(summary.hasCloseout).toBe(true);
    expect(summary.executionScore).toBe(72);
    expect(summary.primaryLeak).toBe("Cardio 65min abaixo");
    expect(summary.evidenceShort).toContain("Treino 12/18 sets");
    expect(summary.tone).toBe("warning");
  });
});

describe("getRecentCloseoutDays", () => {
  const todayDate = "2026-06-27";

  it("retorna apenas dias com fechamento salvo", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 8, 10, [], {
        executionScore: 80,
        closeoutSavedAt: "2026-06-23T22:00:00.000Z",
      }),
      "2026-06-24": makeDia("2026-06-24", 7, 10),
    };

    const days = getRecentCloseoutDays(dias, todayDate);

    expect(days).toHaveLength(1);
    expect(days[0]?.hasCloseout).toBe(true);
    expect(days[0]?.executionScore).toBe(80);
  });
});

describe("getCalendarDayExecutionState", () => {
  const todayDate = "2026-06-27";

  it("retorna empty quando não há closeout", () => {
    const state = getCalendarDayExecutionState(
      "2026-06-23",
      todayDate,
      makeDia("2026-06-23", 8, 10),
    );

    expect(state.hasCloseout).toBe(false);
    expect(state.tone).toBe("empty");
  });

  it("retorna leaks quando closeout possui vazamentos", () => {
    const state = getCalendarDayExecutionState(
      "2026-06-23",
      todayDate,
      makeDia("2026-06-23", 8, 10, [], {
        executionScore: 55,
        closeoutSavedAt: "2026-06-23T22:00:00.000Z",
        closeoutLeaks: ["Cardio 65min abaixo"],
      }),
    );

    expect(state.hasCloseout).toBe(true);
    expect(state.hasLeaks).toBe(true);
    expect(state.tone).toBe("warning");
  });
});

describe("getBestAndWeakestDays", () => {
  it("identifies best and weakest logged days and average adherence", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeDia("2026-06-23", 10, 10),
      "2026-06-24": makeDia("2026-06-24", 5, 10),
      "2026-06-25": makeDia("2026-06-25", 8, 10),
    };

    const result = getBestAndWeakestDays(dias);

    expect(result.bestDay?.date).toBe("2026-06-23");
    expect(result.bestDay?.percentage).toBe(100);
    expect(result.weakestDay?.date).toBe("2026-06-24");
    expect(result.weakestDay?.percentage).toBe(50);
    expect(result.averageAdherence).toBe(77);
  });
});
