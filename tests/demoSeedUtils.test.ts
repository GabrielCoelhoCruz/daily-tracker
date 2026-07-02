import type { HistoricoDia } from "@/stores/useHistoryStore";
import type { PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import type { GymSession } from "@/stores/slices/gymLogSlice";
import {
  clearDemoCheckIns,
  clearDemoGymSessions,
  clearDemoHistory,
  createDemoCheckIns,
  createDemoGymSessions,
  createDemoHistoryDays,
  getDemoHistoryDates,
  getDemoTodaySessionMetrics,
  isDemoId,
  mergeDemoHistory,
  verifyDemoMainLeakIsCardio,
} from "@/utils/demoSeedUtils";
import { getMainWeeklyLeak } from "@/utils/prepReviewUtils";
import { getCompletedSetCount, getSessionVolume } from "@/utils/trainingPerformanceUtils";

const REFERENCE_DATE = "2026-06-23";

describe("createDemoHistoryDays", () => {
  it("gera 13 dias com executionScore e closeoutLeaks", () => {
    const days = createDemoHistoryDays(REFERENCE_DATE);

    expect(Object.keys(days)).toHaveLength(13);
    expect(getDemoHistoryDates(REFERENCE_DATE)).toHaveLength(13);

    for (const entry of Object.values(days)) {
      expect(entry.executionScore).toBeGreaterThan(0);
      expect(entry.closeoutSavedAt).toBeTruthy();
      expect(entry.closeoutEvidence).toBeTruthy();
      expect(Array.isArray(entry.closeoutLeaks)).toBe(true);
    }
  });
});

describe("demo main leak", () => {
  it("principal vazamento demo é cardio", () => {
    const days = createDemoHistoryDays(REFERENCE_DATE);
    const leak = getMainWeeklyLeak(days, REFERENCE_DATE);

    expect(leak?.type).toBe("cardio");
    expect(verifyDemoMainLeakIsCardio(REFERENCE_DATE)).toBe(true);
  });
});

describe("createDemoCheckIns", () => {
  it("gera 4 check-ins com peso descendente e analysis", () => {
    const checkIns = createDemoCheckIns(REFERENCE_DATE);

    expect(checkIns).toHaveLength(4);
    expect(checkIns.every((c) => isDemoId(c.id))).toBe(true);
    expect(checkIns.map((c) => c.weight)).toEqual([84.6, 84.0, 83.8, 83.2]);
    expect(checkIns[3]?.analysis).toContain("parte superior aparenta mais definição");
    expect(checkIns[3]?.photoPaths.length).toBeGreaterThanOrEqual(3);
    expect(checkIns[3]?.scores?.stageReadiness).toBeTruthy();
  });
});

describe("createDemoGymSessions", () => {
  it("gera sessão atual in-progress com sets parciais e volume calculável", () => {
    const sessions = createDemoGymSessions(REFERENCE_DATE);
    const todaySession = sessions.find(
      (session) =>
        session.date === REFERENCE_DATE && session.completedAt == null,
    );

    expect(sessions.length).toBe(4);
    expect(todaySession).toBeDefined();
    expect(todaySession?.id.startsWith("demo-")).toBe(true);

    const completedSets = getCompletedSetCount(todaySession!);
    const volume = getSessionVolume(todaySession!);

    expect(completedSets).toBe(8);
    expect(volume).toBeGreaterThan(4000);

    const metrics = getDemoTodaySessionMetrics(REFERENCE_DATE);
    expect(metrics.completedSets).toBe(8);
    expect(metrics.volumeKg).toBe(volume);
  });
});

describe("clear demo helpers", () => {
  it("clearDemoData remove apenas registros demo e preserva registros reais", () => {
    const demoHistory = createDemoHistoryDays(REFERENCE_DATE);
    const demoDates = getDemoHistoryDates(REFERENCE_DATE);

    const existingHistory: Record<string, HistoricoDia> = {
      "2025-01-01": {
        data: "2025-01-01",
        completados: 10,
        total: 10,
        itensPerdidos: [],
      },
      ...demoHistory,
    };

    const clearedHistory = clearDemoHistory(existingHistory, REFERENCE_DATE);
    expect(clearedHistory["2025-01-01"]).toBeDefined();
    for (const date of demoDates) {
      expect(clearedHistory[date]).toBeUndefined();
    }

    const realCheckIn: PhysiqueCheckIn = {
      id: "real-checkin-1",
      week: 1,
      date: "2025-01-01",
      weight: 85,
      photoPaths: [],
      mode: "full",
    };
    const demoCheckIns = createDemoCheckIns(REFERENCE_DATE);
    const clearedCheckIns = clearDemoCheckIns([realCheckIn, ...demoCheckIns]);
    expect(clearedCheckIns).toHaveLength(1);
    expect(clearedCheckIns[0]?.id).toBe("real-checkin-1");

    const realSession: GymSession = {
      id: "real-session-1",
      treinoId: "treino-a",
      treinoNome: "Peito",
      date: "2025-01-01",
      startedAt: "2025-01-01T18:00:00.000Z",
      completedAt: "2025-01-01T19:00:00.000Z",
      logs: [],
    };
    const demoSessions = Object.fromEntries(
      createDemoGymSessions(REFERENCE_DATE).map((s) => [s.id, s]),
    );
    const mergedSessions = { ...{ "real-session-1": realSession }, ...demoSessions };
    const clearedSessions = clearDemoGymSessions(mergedSessions);

    expect(clearedSessions["real-session-1"]).toBeDefined();
    expect(Object.keys(clearedSessions).every((id) => !isDemoId(id) || id === "real-session-1")).toBe(true);
    expect(Object.keys(clearedSessions)).toEqual(["real-session-1"]);

    const merged = mergeDemoHistory({ "2025-01-01": existingHistory["2025-01-01"]! }, demoHistory);
    expect(Object.keys(merged).length).toBe(14);
  });
});
