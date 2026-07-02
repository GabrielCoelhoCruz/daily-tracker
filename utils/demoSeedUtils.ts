import { getActivePlano } from "@/stores/useProtocolStore";
import { treinos, type Treino } from "@/data/treinos";
import type { HistoricoDia } from "@/stores/useHistoryStore";
import type { PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import type {
  ExerciseLog,
  GymSession,
  TrainingSetLog,
} from "@/stores/slices/gymLogSlice";
import type { DayState } from "@/stores/useDayStore";
import { filtrarItensDoDia, isDiaDeTreino } from "@/utils/diaUtils";
import { getLogicalDate, getLogicalDayOfWeek } from "@/utils/dateUtils";
import {
  buildExerciseSetLogs,
  getCompletedSetCount,
  getSessionVolume,
  getTotalSetCount,
} from "@/utils/trainingPerformanceUtils";
import { getMainWeeklyLeak } from "@/utils/prepReviewUtils";
import { useAthleteStore } from "@/stores/useAthleteStore";
import { useDayStore } from "@/stores/useDayStore";
import { useGymStore } from "@/stores/useGymStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";

export const DEMO_ID_PREFIX = "demo-";

const DEMO_HISTORY_DAY_COUNT = 13;

const DEMO_SCORES_BY_OFFSET: Record<number, number> = {
  13: 68,
  12: 82,
  11: 91,
  10: 74,
  9: 88,
  8: 79,
  7: 93,
  6: 85,
  5: 76,
  4: 90,
  3: 84,
  2: 95,
  1: 72,
};

const DEMO_LEAKS_BY_OFFSET: Record<number, string[]> = {
  13: ["Cardio 65min abaixo"],
  10: ["Cardio 40min abaixo", "1 refeição incompleta"],
  8: ["Hidratação abaixo do alvo"],
  6: ["Cardio 30min abaixo"],
  5: ["Cardio 55min abaixo", "Vazamento no treino"],
  3: ["Cardio 20min abaixo"],
  1: ["Cardio 65min abaixo", "Vazamento no treino"],
};

const WEEK4_ANALYSIS =
  "A parte superior aparenta mais definição em comparação com o check-in anterior. A cintura sugere estar mais justa e o V-taper lê mais forte de frente. A lombar ainda aparenta precisar de mais separação. Mantenha os check-ins semanais consistentes e reavalie após mais uma semana de aderência completa.";

const DEMO_SET_LOADS: { loadKg: number; reps: number }[] = [
  { loadKg: 60, reps: 10 },
  { loadKg: 65, reps: 8 },
  { loadKg: 70, reps: 7 },
  { loadKg: 55, reps: 12 },
  { loadKg: 62, reps: 10 },
  { loadKg: 68, reps: 8 },
  { loadKg: 72, reps: 6 },
  { loadKg: 75, reps: 5 },
];

export type DemoAthleteProfile = {
  name: string;
  gender: "male" | "female";
  heightCm: number;
  currentWeightKg: number;
  phase: string;
  coachName: string;
  competitiveExperience: string;
};

export type DemoSeedPayload = {
  referenceDate: string;
  athleteProfile: DemoAthleteProfile;
  historyDays: Record<string, HistoricoDia>;
  historyDates: string[];
  checkIns: PhysiqueCheckIn[];
  gymSessions: Record<string, GymSession>;
  dayState: Partial<DayState>;
};

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}

export function offsetDate(referenceDate: string, dayOffset: number): string {
  const date = new Date(referenceDate + "T12:00:00");
  date.setDate(date.getDate() - dayOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDemoHistoryDates(referenceDate: string): string[] {
  return Array.from({ length: DEMO_HISTORY_DAY_COUNT }, (_, index) =>
    offsetDate(referenceDate, index + 1),
  );
}

function collectCheckableItemIds(dayOfWeek: number): string[] {
  const periodos = filtrarItensDoDia(getActivePlano().periodos, dayOfWeek, false);
  const ids: string[] = [];

  for (const periodo of periodos) {
    for (const item of periodo.itens) {
      if (item.subItens?.length) {
        for (const sub of item.subItens) {
          if (!sub.opcional) ids.push(sub.id);
        }
      } else if (!item.opcional) {
        ids.push(item.id);
      }
    }
  }

  return ids;
}

function buildEvidence(score: number, leaks: string[]): string {
  const parts = [`Execução ${score}%`];
  if (leaks.length > 0) {
    parts.push(leaks[0] ?? "");
  }
  return parts.filter(Boolean).join(" · ");
}

export function createDemoHistoryDays(
  referenceDate: string,
): Record<string, HistoricoDia> {
  const dias: Record<string, HistoricoDia> = {};

  for (let offset = 1; offset <= DEMO_HISTORY_DAY_COUNT; offset += 1) {
    const date = offsetDate(referenceDate, offset);
    const score = DEMO_SCORES_BY_OFFSET[offset] ?? 80;
    const leaks = DEMO_LEAKS_BY_OFFSET[offset] ?? [];
    const completados = Math.round((score / 100) * 42);

    dias[date] = {
      data: date,
      completados,
      total: 42,
      itensPerdidos: leaks.includes("1 refeição incompleta")
        ? ["Refeição 6"]
        : [],
      executionScore: score,
      closeoutSavedAt: `${date}T22:30:00.000Z`,
      closeoutEvidence: buildEvidence(score, leaks),
      closeoutLeaks: leaks,
      dayNote:
        offset === 1
          ? "Fome alta à noite, treino ok mas cardio ficou curto."
          : undefined,
    };
  }

  return dias;
}

export function createDemoCheckIns(referenceDate: string): PhysiqueCheckIn[] {
  const weights = [84.6, 84.0, 83.8, 83.2];
  const readiness = ["progredindo", "progredindo", "se_aproximando", "se_aproximando"] as const;
  const conditioning = [6, 7, 7, 8];
  const vTapers = [6, 6, 7, 7];

  return weights.map((weight, index) => {
    const week = index + 1;
    const date = offsetDate(referenceDate, (4 - week) * 7);
    const previousWeight = index > 0 ? weights[index - 1] : undefined;

    return {
      id: `${DEMO_ID_PREFIX}checkin-week-${week}`,
      week,
      date,
      weight,
      previousWeight,
      notes: week === 4 ? "Semana 4 de cutting — frontal/lateral/costas capturadas." : undefined,
      photoPaths: [
        `${DEMO_ID_PREFIX}photo-week-${week}-front`,
        `${DEMO_ID_PREFIX}photo-week-${week}-side`,
        `${DEMO_ID_PREFIX}photo-week-${week}-back`,
      ],
      analysis: week === 4 ? WEEK4_ANALYSIS : `Análise de demonstração do check-in da semana ${week}.`,
      mode: "full" as const,
      targetCategory: "classic_physique" as const,
      weeksToCompetition: 12 - week,
      // Legacy/demo analysis output, intentionally hidden from MVP UI.
      scores: {
        overallConditioning: conditioning[index],
        stageReadiness: readiness[index],
        vTaper: vTapers[index],
      },
    };
  });
}

function buildExerciseLogsWithProgress(
  treino: Treino,
  completedSetCount: number,
  setLoads: { loadKg: number; reps: number }[],
): ExerciseLog[] {
  let remaining = completedSetCount;
  let loadIndex = 0;

  return treino.exercicios.map((exercicio) => {
    const baseSets = buildExerciseSetLogs(exercicio);
    const sets: TrainingSetLog[] = baseSets.map((set) => {
      if (remaining <= 0) return set;

      const load = setLoads[loadIndex] ?? { loadKg: 40, reps: 10 };
      loadIndex += 1;
      remaining -= 1;

      return {
        ...set,
        loadKg: load.loadKg,
        repsCompleted: load.reps,
        isCompleted: true,
        completedAt: "2026-01-01T12:00:00.000Z",
      };
    });

    return {
      exercicioId: exercicio.id,
      nome: exercicio.nome,
      plannedSets: sets.length,
      sets,
    };
  });
}

function buildCompletedSession(
  id: string,
  treino: Treino,
  date: string,
  setLoads: { loadKg: number; reps: number }[],
): GymSession {
  const logs = buildExerciseLogsWithProgress(
    treino,
    setLoads.length,
    setLoads,
  );

  return {
    id,
    treinoId: treino.id,
    treinoNome: treino.grupoMuscular,
    date,
    startedAt: `${date}T18:00:00.000Z`,
    completedAt: `${date}T19:30:00.000Z`,
    logs,
  };
}

export function createDemoGymSessions(referenceDate: string): GymSession[] {
  const treinoA = treinos.find((t) => t.id === "treino-a")!;
  const treinoB = treinos.find((t) => t.id === "treino-b")!;
  const treinoC = treinos.find((t) => t.id === "treino-c")!;
  const treinoD = treinos.find((t) => t.id === "treino-d")!;

  const completeLoadsB = [
    { loadKg: 80, reps: 8 },
    { loadKg: 85, reps: 6 },
    { loadKg: 90, reps: 5 },
    { loadKg: 70, reps: 10 },
    { loadKg: 75, reps: 8 },
    { loadKg: 60, reps: 12 },
  ];

  const completeLoadsC = [
    { loadKg: 100, reps: 10 },
    { loadKg: 110, reps: 8 },
    { loadKg: 120, reps: 6 },
    { loadKg: 90, reps: 12 },
    { loadKg: 95, reps: 10 },
  ];

  const partialLoadsD = [
    { loadKg: 50, reps: 12 },
    { loadKg: 55, reps: 10 },
    { loadKg: 60, reps: 8 },
    { loadKg: 45, reps: 15 },
  ];

  const sessions: GymSession[] = [
    buildCompletedSession(
      `${DEMO_ID_PREFIX}session-treino-b-${offsetDate(referenceDate, 10)}`,
      treinoB,
      offsetDate(referenceDate, 10),
      completeLoadsB,
    ),
    buildCompletedSession(
      `${DEMO_ID_PREFIX}session-treino-c-${offsetDate(referenceDate, 7)}`,
      treinoC,
      offsetDate(referenceDate, 7),
      completeLoadsC,
    ),
    {
      ...buildCompletedSession(
        `${DEMO_ID_PREFIX}session-treino-d-${offsetDate(referenceDate, 3)}`,
        treinoD,
        offsetDate(referenceDate, 3),
        partialLoadsD,
      ),
      completedAt: null,
    },
    {
      id: `${DEMO_ID_PREFIX}session-treino-a-${referenceDate}`,
      treinoId: treinoA.id,
      treinoNome: treinoA.grupoMuscular,
      date: referenceDate,
      startedAt: `${referenceDate}T17:30:00.000Z`,
      completedAt: null,
      logs: buildExerciseLogsWithProgress(treinoA, 8, DEMO_SET_LOADS),
    },
  ];

  return sessions;
}

export function createDemoAthleteProfile(): DemoAthleteProfile {
  return {
    name: "Gabriel",
    gender: "male",
    heightCm: 172,
    currentWeightKg: 83.2,
    phase: "Cutting",
    coachName: "Team GB",
    competitiveExperience: "Prep competitivo",
  };
}

export function createDemoDayState(
  referenceDate: string,
  dayOfWeek = getLogicalDayOfWeek(new Date(referenceDate + "T12:00:00")),
): Partial<DayState> {
  const itemIds = collectCheckableItemIds(dayOfWeek);
  const checks: DayState["checks"] = {};

  itemIds.forEach((id, index) => {
    if (index < Math.floor(itemIds.length * 0.82)) {
      checks[id] = { checked: true, timestamp: Date.now() - index * 1000 };
    }
  });

  return {
    checks,
    diaOffManual: false,
    treinoHojeId: null,
    aguaMl: 3100,
    chaMl: 500,
    sessoesCardio: [{ minutos: 25, timestamp: Date.now() }],
    refeicaoLivreUsada: false,
    refeicaoLivrePeriodoId: null,
    ultimoReset: referenceDate,
  };
}

export function mergeDemoHistory(
  existing: Record<string, HistoricoDia>,
  demo: Record<string, HistoricoDia>,
): Record<string, HistoricoDia> {
  return { ...existing, ...demo };
}

export function clearDemoHistory(
  existing: Record<string, HistoricoDia>,
  referenceDate: string,
): Record<string, HistoricoDia> {
  const next = { ...existing };
  for (const date of getDemoHistoryDates(referenceDate)) {
    delete next[date];
  }
  return next;
}

export function clearDemoCheckIns(existing: PhysiqueCheckIn[]): PhysiqueCheckIn[] {
  return existing.filter((checkIn) => !isDemoId(checkIn.id));
}

export function clearDemoGymSessions(
  existing: Record<string, GymSession>,
): Record<string, GymSession> {
  const next = { ...existing };
  for (const id of Object.keys(next)) {
    if (isDemoId(id)) delete next[id];
  }
  return next;
}

export function buildDemoSeedPayload(referenceDate: string): DemoSeedPayload {
  const historyDays = createDemoHistoryDays(referenceDate);
  const checkIns = createDemoCheckIns(referenceDate);
  const gymSessionsList = createDemoGymSessions(referenceDate);
  const gymSessions = Object.fromEntries(
    gymSessionsList.map((session) => [session.id, session]),
  );

  return {
    referenceDate,
    athleteProfile: createDemoAthleteProfile(),
    historyDays,
    historyDates: getDemoHistoryDates(referenceDate),
    checkIns,
    gymSessions,
    dayState: createDemoDayState(referenceDate),
  };
}

export function getDemoSeedStats(referenceDate: string): {
  historyDays: number;
  checkIns: number;
  sessions: number;
} {
  return {
    historyDays: DEMO_HISTORY_DAY_COUNT,
    checkIns: 4,
    sessions: createDemoGymSessions(referenceDate).length,
  };
}

export function getDemoTodaySessionMetrics(referenceDate: string): {
  completedSets: number;
  totalSets: number;
  volumeKg: number;
} {
  const session = createDemoGymSessions(referenceDate).find(
    (item) => item.date === referenceDate && !item.completedAt,
  );

  if (!session) {
    return { completedSets: 0, totalSets: 0, volumeKg: 0 };
  }

  return {
    completedSets: getCompletedSetCount(session),
    totalSets: getTotalSetCount(session),
    volumeKg: getSessionVolume(session),
  };
}

export function seedDemoData(referenceDate = getLogicalDate(new Date())): void {
  const payload = buildDemoSeedPayload(referenceDate);

  clearDemoData(referenceDate);

  // Não sobrescreve perfil real já configurado — demo só preenche perfil vazio.
  if (!useAthleteStore.getState().isProfileComplete()) {
    useAthleteStore.getState().updateProfile(payload.athleteProfile);
  }

  useHistoryStore.setState((state) => ({
    dias: mergeDemoHistory(state.dias, payload.historyDays),
  }));

  usePhysiqueStore.setState((state) => ({
    checkIns: [...clearDemoCheckIns(state.checkIns), ...payload.checkIns],
    lastCategory: "classic_physique",
  }));

  useGymStore.setState((state) => ({
    gymSessions: {
      ...clearDemoGymSessions(state.gymSessions),
      ...payload.gymSessions,
    },
  }));

  useDayStore.setState((state) => ({
    ...state,
    ...payload.dayState,
  }));
}

export function clearDemoData(referenceDate = getLogicalDate(new Date())): void {
  useHistoryStore.setState((state) => ({
    dias: clearDemoHistory(state.dias, referenceDate),
  }));

  usePhysiqueStore.setState((state) => ({
    checkIns: clearDemoCheckIns(state.checkIns),
  }));

  useGymStore.setState((state) => ({
    gymSessions: clearDemoGymSessions(state.gymSessions),
  }));
}

export function hasDemoData(
  referenceDate = getLogicalDate(new Date()),
): boolean {
  const historyDates = getDemoHistoryDates(referenceDate);
  const dias = useHistoryStore.getState().dias;
  const hasHistory = historyDates.some(
    (date) => dias[date]?.closeoutSavedAt != null,
  );
  const hasCheckIns = usePhysiqueStore
    .getState()
    .checkIns.some((checkIn) => isDemoId(checkIn.id));
  const hasSessions = Object.keys(useGymStore.getState().gymSessions).some(
    isDemoId,
  );

  return hasHistory || hasCheckIns || hasSessions;
}

export function verifyDemoMainLeakIsCardio(referenceDate: string): boolean {
  const leak = getMainWeeklyLeak(createDemoHistoryDays(referenceDate), referenceDate);
  return leak?.type === "cardio";
}

export { getSessionVolume, getCompletedSetCount, isDiaDeTreino };
