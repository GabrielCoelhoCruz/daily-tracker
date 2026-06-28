import type { Exercicio, Serie } from '@/data/treinos'
import type {
  ExerciseLog,
  GymSession,
  TrainingSetLog,
  TrainingSetType,
} from '@/stores/slices/gymLogSlice'

const SERIE_TYPE_MAP: Record<Serie['tipo'], TrainingSetType> = {
  WS: 'working',
  TS: 'top',
  BS: 'backoff',
  CS: 'cluster',
}

export const SET_TYPE_LABELS: Record<TrainingSetType, string> = {
  warmup: 'Aquecimento',
  working: 'Working Set',
  top: 'Top Set',
  backoff: 'Back-off',
  drop: 'Drop Set',
  cluster: 'Cluster',
}

export const DEFAULT_REST_SECONDS: Record<TrainingSetType, number> = {
  warmup: 60,
  working: 90,
  top: 150,
  backoff: 90,
  drop: 60,
  cluster: 60,
}

function createTrainingSetLog(
  exercicioId: string,
  setNumber: number,
  plannedSetType: TrainingSetType,
  plannedReps: number | string | null,
): TrainingSetLog {
  return {
    id: `${exercicioId}-set-${setNumber}`,
    setNumber,
    plannedSetType,
    completedSetType: plannedSetType,
    plannedReps,
    targetReps: plannedReps,
    loadKg: null,
    repsCompleted: null,
    rpe: null,
    rir: null,
    isFailure: false,
    isCompleted: false,
    completedAt: null,
  }
}

export function serieTipoToTrainingSetType(tipo: Serie['tipo']): TrainingSetType {
  return SERIE_TYPE_MAP[tipo] ?? 'working'
}

export function buildExerciseSetLogs(exercicio: Exercicio): TrainingSetLog[] {
  const sets: TrainingSetLog[] = []
  let setNumber = 1

  for (const serie of exercicio.series) {
    const setType = serieTipoToTrainingSetType(serie.tipo)
    const plannedReps = serie.reps ?? null

    for (let i = 0; i < serie.series; i += 1) {
      sets.push(createTrainingSetLog(exercicio.id, setNumber, setType, plannedReps))
      setNumber += 1
    }
  }

  return sets
}

export function migrateLegacyExerciseLog(
  log: ExerciseLog,
  exercicio?: Exercicio,
): ExerciseLog {
  if (log.sets && log.sets.length > 0) {
    return {
      ...log,
      plannedSets: log.plannedSets ?? log.sets.length,
    }
  }

  if (exercicio) {
    const sets = buildExerciseSetLogs(exercicio)
    if (log.cargaKg != null && sets.length > 0) {
      sets[0] = {
        ...sets[0],
        loadKg: log.cargaKg,
        repsCompleted: log.repeticoes ?? null,
        isCompleted: true,
      }
    }
    return {
      ...log,
      plannedSets: sets.length,
      sets,
    }
  }

  const seriesCount = log.series ?? 1
  const sets: TrainingSetLog[] = []

  for (let i = 1; i <= seriesCount; i += 1) {
    const set = createTrainingSetLog(
      log.exercicioId,
      i,
      'working',
      log.repeticoes ?? null,
    )
    if (i === 1 && log.cargaKg != null) {
      sets.push({
        ...set,
        loadKg: log.cargaKg,
        repsCompleted: log.repeticoes ?? null,
        isCompleted: true,
      })
    } else {
      sets.push(set)
    }
  }

  return {
    ...log,
    plannedSets: sets.length,
    sets,
  }
}

export function normalizeExerciseLog(
  log: ExerciseLog,
  exercicio?: Exercicio,
): ExerciseLog {
  return migrateLegacyExerciseLog(log, exercicio)
}

export function normalizeGymSession(
  session: GymSession,
  exercicios?: Exercicio[],
): GymSession {
  const exercicioMap = new Map(exercicios?.map((ex) => [ex.id, ex]) ?? [])

  return {
    ...session,
    startedAt: session.startedAt ?? session.date,
    completedAt: session.completedAt ?? null,
    logs: session.logs.map((log) =>
      normalizeExerciseLog(log, exercicioMap.get(log.exercicioId)),
    ),
  }
}

export function getSetVolume(
  loadKg: number | null,
  repsCompleted: number | null,
): number {
  if (loadKg == null || repsCompleted == null) return 0
  if (!Number.isFinite(loadKg) || !Number.isFinite(repsCompleted)) return 0
  if (repsCompleted <= 0 || loadKg <= 0) return 0
  return Math.round(loadKg * repsCompleted)
}

export function getExerciseVolume(exerciseLog: ExerciseLog): number {
  const sets = exerciseLog.sets ?? []
  return sets.reduce(
    (total, set) =>
      set.isCompleted
        ? total + getSetVolume(set.loadKg, set.repsCompleted)
        : total,
    0,
  )
}

export function getSessionVolume(session: GymSession): number {
  return session.logs.reduce((total, log) => total + getExerciseVolume(log), 0)
}

export function getCompletedSetCount(session: GymSession): number {
  return session.logs.reduce(
    (total, log) =>
      total + (log.sets?.filter((set) => set.isCompleted).length ?? 0),
    0,
  )
}

export function getTotalSetCount(session: GymSession): number {
  return session.logs.reduce(
    (total, log) => total + (log.sets?.length ?? log.plannedSets ?? 0),
    0,
  )
}

export type CurrentSetContext = {
  exercicioId: string
  exerciseName: string
  exerciseIndex: number
  totalExercises: number
  set: TrainingSetLog
  setIndex: number
  totalSetsInExercise: number
  status: 'not-started' | 'active' | 'complete'
}

export function getNextIncompleteSet(
  session: GymSession,
): { exercicioId: string; setId: string } | null {
  for (const log of session.logs) {
    const sets = log.sets ?? []
    const next = sets.find((set) => !set.isCompleted)
    if (next) {
      return { exercicioId: log.exercicioId, setId: next.id }
    }
  }
  return null
}

export function getCurrentSet(
  session: GymSession | undefined,
  exercicios: Exercicio[],
): CurrentSetContext | null {
  if (!session) return null

  const normalized = normalizeGymSession(session, exercicios)
  const next = getNextIncompleteSet(normalized)

  if (!next) {
    const lastLog = normalized.logs[normalized.logs.length - 1]
    const lastSets = lastLog?.sets ?? []
    const lastSet = lastSets[lastSets.length - 1]
    if (!lastLog || !lastSet) return null

    return {
      exercicioId: lastLog.exercicioId,
      exerciseName: lastLog.nome,
      exerciseIndex: normalized.logs.length - 1,
      totalExercises: normalized.logs.length,
      set: lastSet,
      setIndex: lastSets.length - 1,
      totalSetsInExercise: lastSets.length,
      status: 'complete',
    }
  }

  const exerciseIndex = normalized.logs.findIndex(
    (log) => log.exercicioId === next.exercicioId,
  )
  const log = normalized.logs[exerciseIndex]
  const sets = log.sets ?? []
  const setIndex = sets.findIndex((set) => set.id === next.setId)
  const set = sets[setIndex]

  if (!set) return null

  const hasAnyCompleted = getCompletedSetCount(normalized) > 0

  return {
    exercicioId: log.exercicioId,
    exerciseName: log.nome,
    exerciseIndex,
    totalExercises: normalized.logs.length,
    set,
    setIndex,
    totalSetsInExercise: sets.length,
    status: hasAnyCompleted ? 'active' : 'active',
  }
}

export type BestSetResult = {
  setNumber: number
  loadKg: number
  repsCompleted: number
  volume: number
}

export function getExerciseBestSet(
  exerciseLog: ExerciseLog,
): BestSetResult | null {
  const sets = exerciseLog.sets ?? []
  let best: BestSetResult | null = null

  for (const set of sets) {
    if (!set.isCompleted) continue
    const volume = getSetVolume(set.loadKg, set.repsCompleted)
    if (volume <= 0) continue
    if (
      !best ||
      volume > best.volume ||
      (volume === best.volume &&
        (set.loadKg ?? 0) > best.loadKg)
    ) {
      best = {
        setNumber: set.setNumber,
        loadKg: set.loadKg ?? 0,
        repsCompleted: set.repsCompleted ?? 0,
        volume,
      }
    }
  }

  return best
}

export function getPreviousExerciseLog(
  exercicioId: string,
  currentDate: string,
  sessions: GymSession[],
  exercicios?: Exercicio[],
): ExerciseLog | null {
  const priorSessions = sessions
    .filter((session) => session.date < currentDate)
    .sort((a, b) => b.date.localeCompare(a.date))

  for (const session of priorSessions) {
    const normalized = normalizeGymSession(session, exercicios)
    const log = normalized.logs.find((entry) => entry.exercicioId === exercicioId)
    if (!log) continue

    const hasData =
      log.cargaKg != null ||
      (log.sets?.some((set) => set.isCompleted) ?? false)

    if (hasData) return log
  }

  return null
}

export type ExercisePerformanceComparison = {
  currentVolume: number
  previousVolume: number
  volumeDelta: number
  volumeDeltaPercent: number | null
  currentBestSet: BestSetResult | null
  previousBestSet: BestSetResult | null
  loadDelta: number | null
}

export function getExerciseProgressComparison(
  currentExerciseLog: ExerciseLog,
  previousExerciseLog: ExerciseLog | null,
): ExercisePerformanceComparison {
  const currentVolume = getExerciseVolume(currentExerciseLog)
  const previousVolume = previousExerciseLog
    ? getExerciseVolume(previousExerciseLog)
    : 0
  const volumeDelta = currentVolume - previousVolume
  const volumeDeltaPercent =
    previousVolume > 0
      ? Math.round((volumeDelta / previousVolume) * 1000) / 10
      : null

  const currentBestSet = getExerciseBestSet(currentExerciseLog)
  const previousBestSet = previousExerciseLog
    ? getExerciseBestSet(previousExerciseLog)
    : null

  const loadDelta =
    currentBestSet && previousBestSet
      ? Math.round((currentBestSet.loadKg - previousBestSet.loadKg) * 10) / 10
      : null

  return {
    currentVolume,
    previousVolume,
    volumeDelta,
    volumeDeltaPercent,
    currentBestSet,
    previousBestSet,
    loadDelta,
  }
}

export function formatVolumeKg(volume: number): string {
  return `${volume.toLocaleString('pt-BR')}kg`
}

export function getExerciseCompletedSetCount(exerciseLog: ExerciseLog): number {
  return exerciseLog.sets?.filter((set) => set.isCompleted).length ?? 0
}

export function isExerciseFullyLogged(exerciseLog: ExerciseLog): boolean {
  const sets = exerciseLog.sets ?? []
  if (sets.length > 0) {
    return sets.every((set) => set.isCompleted)
  }
  return exerciseLog.cargaKg != null
}

export function getRestSecondsForSetType(setType: TrainingSetType): number {
  return DEFAULT_REST_SECONDS[setType] ?? 90
}
