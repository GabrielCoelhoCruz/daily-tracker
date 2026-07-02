import type { PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import {
  getLatestCheckIn,
  getPhysiqueIntelligenceSummary,
  getStageReadinessTrend,
  getWeightTrendSummary,
  getLatestAISignal,
  getEvidenceSnapshot,
  getEvidenceAISignal,
  getPhysiquePrepContext,
  getNextPhysiqueAction,
  getCheckInTimelineItems,
} from "@/utils/physiqueIntelligenceUtils";
import type { HistoricoDia } from "@/stores/useHistoryStore";

function makeCheckIn(
  overrides: Partial<PhysiqueCheckIn> & Pick<PhysiqueCheckIn, "id" | "week">
): PhysiqueCheckIn {
  return {
    date: "2026-03-01",
    weight: 80,
    photoPaths: [],
    mode: "full",
    ...overrides,
  };
}

describe("getLatestCheckIn", () => {
  it("returns null when there are no check-ins", () => {
    expect(getLatestCheckIn([])).toBeNull();
  });

  it("returns highest week as latest", () => {
    const checkIns = [
      makeCheckIn({ id: "a", week: 2, date: "2026-03-08" }),
      makeCheckIn({ id: "b", week: 4, date: "2026-03-22" }),
      makeCheckIn({ id: "c", week: 3, date: "2026-03-15" }),
    ];

    expect(getLatestCheckIn(checkIns)?.id).toBe("b");
  });

  it("uses newest date when weeks are equal", () => {
    const checkIns = [
      makeCheckIn({ id: "older", week: 4, date: "2026-03-20" }),
      makeCheckIn({ id: "newer", week: 4, date: "2026-03-22" }),
    ];

    expect(getLatestCheckIn(checkIns)?.id).toBe("newer");
  });
});

describe("getPhysiqueIntelligenceSummary", () => {
  it("returns empty summary when there are no check-ins", () => {
    const summary = getPhysiqueIntelligenceSummary([], { lastCategory: "classic_physique" });

    expect(summary.hasCheckIns).toBe(false);
    expect(summary.latestCheckIn).toBeNull();
    expect(summary.checkInCount).toBe(0);
    expect(summary.latestWeightKg).toBeNull();
    expect(summary.weightDeltaKg).toBeNull();
    expect(summary.stageReadinessLabel).toBeNull();
    expect(summary.stageReadinessTone).toBe("empty");
    expect(summary.overallConditioning).toBeNull();
    expect(summary.vTaper).toBeNull();
    expect(summary.targetCategoryLabel).toBeNull();
  });

  it("returns latest weight, scores, category, and check-in count", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        weight: 83.2,
        targetCategory: "classic_physique",
        scores: {
          overallConditioning: 8,
          stageReadiness: "se_aproximando",
          vTaper: 7,
        },
      }),
      makeCheckIn({ id: "older", week: 3, weight: 84 }),
    ];

    const summary = getPhysiqueIntelligenceSummary(checkIns);

    expect(summary.hasCheckIns).toBe(true);
    expect(summary.latestCheckIn?.id).toBe("latest");
    expect(summary.checkInCount).toBe(2);
    expect(summary.latestWeightKg).toBe(83.2);
    expect(summary.overallConditioning).toBe(8);
    expect(summary.vTaper).toBe(7);
    expect(summary.stageReadinessLabel).toBe("Se aproximando");
    expect(summary.stageReadinessTone).toBe("close");
    expect(summary.targetCategoryLabel).toBe("Classic Physique");
  });

  it("uses previousWeight to calculate weight delta", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        weight: 83.2,
        previousWeight: 83.8,
      }),
    ];

    const summary = getPhysiqueIntelligenceSummary(checkIns);
    expect(summary.weightDeltaKg).toBe(-0.6);
  });

  it("does not invent missing scores", () => {
    const checkIns = [makeCheckIn({ id: "a", week: 1, weight: 85 })];

    const summary = getPhysiqueIntelligenceSummary(checkIns);

    expect(summary.overallConditioning).toBeNull();
    expect(summary.vTaper).toBeNull();
    expect(summary.stageReadinessLabel).toBeNull();
    expect(summary.stageReadinessTone).toBe("empty");
  });

  it("falls back to athlete profile category when check-in has none", () => {
    const checkIns = [makeCheckIn({ id: "a", week: 1 })];
    const summary = getPhysiqueIntelligenceSummary(checkIns, {
      lastCategory: "classic_physique",
    });

    expect(summary.targetCategoryLabel).toBe("Classic Physique");
  });
});

describe("getStageReadinessTrend", () => {
  it("returns unknown with fewer than two scored check-ins", () => {
    const checkIns = [
      makeCheckIn({
        id: "a",
        week: 2,
        scores: { stageReadiness: "progredindo" },
      }),
    ];

    expect(getStageReadinessTrend(checkIns)).toEqual({
      direction: "unknown",
      previousLabel: null,
      currentLabel: "Evolução em andamento",
    });
  });

  it("returns improving when latest stage readiness is higher", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        date: "2026-03-22",
        scores: { stageReadiness: "quase_pronto" },
      }),
      makeCheckIn({
        id: "previous",
        week: 3,
        date: "2026-03-15",
        scores: { stageReadiness: "progredindo" },
      }),
    ];

    expect(getStageReadinessTrend(checkIns)).toEqual({
      direction: "improving",
      previousLabel: "Evolução em andamento",
      currentLabel: "Condição competitiva",
    });
  });

  it("returns declining when latest stage readiness is lower", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        scores: { stageReadiness: "longe" },
      }),
      makeCheckIn({
        id: "previous",
        week: 3,
        scores: { stageReadiness: "progredindo" },
      }),
    ];

    expect(getStageReadinessTrend(checkIns).direction).toBe("declining");
  });

  it("returns stable when unchanged", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        scores: { stageReadiness: "progredindo" },
      }),
      makeCheckIn({
        id: "previous",
        week: 3,
        scores: { stageReadiness: "progredindo" },
      }),
    ];

    expect(getStageReadinessTrend(checkIns).direction).toBe("stable");
  });
});

describe("getWeightTrendSummary", () => {
  it("uses latest previousWeight when available", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        weight: 83.2,
        previousWeight: 83.8,
      }),
    ];

    expect(getWeightTrendSummary(checkIns)).toEqual({
      latestWeightKg: 83.2,
      deltaKg: -0.6,
      direction: "down",
    });
  });

  it("falls back to comparing latest two check-ins", () => {
    const checkIns = [
      makeCheckIn({ id: "latest", week: 4, weight: 82.5, date: "2026-03-22" }),
      makeCheckIn({ id: "prev", week: 3, weight: 83.1, date: "2026-03-15" }),
    ];

    expect(getWeightTrendSummary(checkIns)).toEqual({
      latestWeightKg: 82.5,
      deltaKg: -0.6,
      direction: "down",
    });
  });

  it("rounds delta to one decimal", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 2,
        weight: 80.04,
        previousWeight: 80,
      }),
    ];

    expect(getWeightTrendSummary(checkIns).deltaKg).toBe(0);
  });

  it("returns unknown when insufficient data exists", () => {
    const checkIns = [makeCheckIn({ id: "only", week: 1, weight: 80 })];

    expect(getWeightTrendSummary(checkIns)).toEqual({
      latestWeightKg: 80,
      deltaKg: null,
      direction: "unknown",
    });
  });
});

describe("getLatestAISignal", () => {
  it("returns first-check-in prompt when no check-in exists", () => {
    const signal = getLatestAISignal(null, 0);

    expect(signal.hasAnalysis).toBe(false);
    expect(signal.message).toMatch(/primeiro check-in/i);
  });

  it("returns pending-analysis message when latest check-in has no analysis", () => {
    const signal = getLatestAISignal(makeCheckIn({ id: "a", week: 1 }), 1);

    expect(signal.hasAnalysis).toBe(false);
    expect(signal.message).toMatch(/Análise pendente/i);
  });

  it("extracts concise signal from markdown analysis", () => {
    const checkIn = makeCheckIn({
      id: "a",
      week: 4,
      analysis: "## Upper Body\nUpper body sharper. Lower back still needs tightening.\n\n## Next Steps\nCut carbs.",
    });

    const signal = getLatestAISignal(checkIn, 2);

    expect(signal.hasAnalysis).toBe(true);
    expect(signal.message).toBe(
      "Upper body sharper. Lower back still needs tightening."
    );
  });

  it("strips markdown heading markers", () => {
    const checkIn = makeCheckIn({
      id: "a",
      week: 2,
      analysis: "### Conditioning\nV-taper improving week over week.",
    });

    const signal = getLatestAISignal(checkIn, 2);
    expect(signal.message).toBe("V-taper improving week over week.");
  });

  it("falls back to first 180 characters", () => {
    const longLine = "A".repeat(220);
    const checkIn = makeCheckIn({
      id: "a",
      week: 1,
      analysis: longLine,
    });

    const signal = getLatestAISignal(checkIn, 2);
    expect(signal.message.length).toBeLessThanOrEqual(181);
    expect(signal.message.endsWith("…")).toBe(true);
  });
});

describe("getNextPhysiqueAction", () => {
  it("suggests complete profile when profile is incomplete", () => {
    const action = getNextPhysiqueAction([], false);

    expect(action.type).toBe("complete-profile");
    if (action.type === "complete-profile") {
      expect(action.route).toBe("./profile");
    }
  });

  it("suggests new check-in when no check-ins exist", () => {
    const action = getNextPhysiqueAction([], true);

    expect(action.type).toBe("new-checkin");
    if (action.type === "new-checkin") {
      expect(action.route).toBe("./new-checkin");
    }
  });

  it("suggests new check-in when only one check-in exists", () => {
    const checkIns = [makeCheckIn({ id: "a", week: 1 })];
    const action = getNextPhysiqueAction(checkIns, true);

    expect(action.type).toBe("new-checkin");
  });

  it("suggests compare when two or more check-ins exist", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 2,
        date: "2026-03-15",
        analysis: "Great progress.",
      }),
      makeCheckIn({ id: "older", week: 1, date: "2026-03-08" }),
    ];

    const action = getNextPhysiqueAction(checkIns, true);
    expect(action.type).toBe("compare");
  });
});

describe("getCheckInTimelineItems", () => {
  it("returns timeline items sorted newest first", () => {
    const checkIns = [
      makeCheckIn({ id: "w2", week: 2, date: "2026-03-15" }),
      makeCheckIn({ id: "w4", week: 4, date: "2026-03-29" }),
      makeCheckIn({ id: "w3", week: 3, date: "2026-03-22" }),
    ];

    const items = getCheckInTimelineItems(checkIns);
    expect(items.map((item) => item.id)).toEqual(["w4", "w3", "w2"]);
  });

  it("includes mode label, weight delta, stage readiness label, analysis state, and thumbnail", () => {
    const checkIns = [
      makeCheckIn({
        id: "a",
        week: 4,
        weight: 83.2,
        previousWeight: 83.8,
        mode: "full",
        photoPaths: ["file:///photo.jpg"],
        analysis: "Analysis text",
        scores: { stageReadiness: "se_aproximando" },
      }),
    ];

    const item = getCheckInTimelineItems(checkIns)[0];

    expect(item).toMatchObject({
      id: "a",
      week: 4,
      weightKg: 83.2,
      weightDeltaKg: -0.6,
      modeLabel: "Completa",
      stageReadinessLabel: "Se aproximando",
      hasAnalysis: true,
      thumbnailUri: "file:///photo.jpg",
    });
  });
});

describe("getEvidenceSnapshot", () => {
  const referenceDate = "2026-06-27";

  it("retorna empty quando não há check-ins", () => {
    const snapshot = getEvidenceSnapshot([], referenceDate);

    expect(snapshot.hasEvidence).toBe(false);
    expect(snapshot.freshnessStatus).toBe("empty");
    expect(snapshot.nextActionLabel).toBe("Criar primeiro check-in");
  });

  it("calcula daysSinceCheckIn e freshnessStatus", () => {
    const checkIns = [
      makeCheckIn({
        id: "latest",
        week: 4,
        date: "2026-06-20",
        weight: 83.2,
        photoPaths: ["a", "b", "c"],
        analysis: "Sharp upper body.",
      }),
    ];

    const snapshot = getEvidenceSnapshot(checkIns, referenceDate);

    expect(snapshot.daysSinceCheckIn).toBe(7);
    expect(snapshot.freshnessStatus).toBe("due-soon");
    expect(snapshot.hasAnalysis).toBe(true);
    expect(snapshot.photoCount).toBe(3);
    expect(snapshot.evidenceLabel).toContain("Semana 4");
    expect(snapshot.evidenceLabel).toContain("83.2kg");
  });

  it("marca overdue após 10 dias", () => {
    const snapshot = getEvidenceSnapshot(
      [makeCheckIn({ id: "a", week: 3, date: "2026-06-10" })],
      referenceDate,
    );

    expect(snapshot.freshnessStatus).toBe("overdue");
    expect(snapshot.nextActionLabel).toBe("Criar novo check-in");
  });
});

describe("getEvidenceAISignal", () => {
  it("inclui limitação quando há menos de 2 check-ins", () => {
    const signal = getEvidenceAISignal(
      makeCheckIn({ id: "a", week: 1, analysis: "Progress visible." }),
      1,
    );

    expect(signal.limitation).toMatch(/2 check-ins/i);
  });

  it("inclui limitação quando há menos de 3 fotos", () => {
    const signal = getEvidenceAISignal(
      makeCheckIn({
        id: "a",
        week: 2,
        photoPaths: ["front.jpg"],
        analysis: "Good conditioning.",
      }),
      2,
    );

    expect(signal.limitation).toMatch(/menos de 3 fotos/i);
    expect(signal.evidence).toContain("Week 2");
  });
});

describe("getPhysiquePrepContext", () => {
  const referenceDate = "2026-06-27";

  function makeHistorico(
    data: string,
    executionScore: number,
    leaks: string[] = [],
  ): HistoricoDia {
    return {
      data,
      completados: 8,
      total: 10,
      itensPerdidos: [],
      executionScore,
      closeoutSavedAt: `${data}T22:00:00.000Z`,
      closeoutLeaks: leaks,
    };
  }

  it("calcula averageExecutionScore usando closeouts", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeHistorico("2026-06-23", 80),
      "2026-06-25": makeHistorico("2026-06-25", 90),
    };

    const context = getPhysiquePrepContext(dias, referenceDate);

    expect(context.hasCloseouts).toBe(true);
    expect(context.averageExecutionScore).toBe(85);
    expect(context.closedDays).toBe(2);
    expect(context.evidence).toContain("85% execução média");
  });

  it("retorna mainLeakTitle sem inventar correlação", () => {
    const dias: Record<string, HistoricoDia> = {
      "2026-06-23": makeHistorico("2026-06-23", 70, ["Cardio 65min abaixo"]),
      "2026-06-24": makeHistorico("2026-06-24", 72, ["Cardio 40min abaixo"]),
    };

    const context = getPhysiquePrepContext(dias, referenceDate);

    expect(context.mainLeakTitle).toContain("Cardio incompleto");
    expect(context.evidence).toContain("Use esse contexto");
    expect(context.evidence).not.toMatch(/causou|por causa|devido ao shape/i);
  });

  it("retorna estado vazio quando não há closeouts", () => {
    const context = getPhysiquePrepContext({}, referenceDate);

    expect(context.hasCloseouts).toBe(false);
    expect(context.averageExecutionScore).toBeNull();
    expect(context.mainLeakTitle).toBeNull();
  });
});
