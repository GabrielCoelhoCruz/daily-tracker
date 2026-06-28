import type { Exercicio, Serie, Treino } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  getCompletedSetCount,
  getCurrentSet,
  getExerciseBestSet,
  getExerciseCompletedSetCount,
  getPreviousExerciseLog,
  getTotalSetCount,
  isExerciseFullyLogged,
  migrateLegacyExerciseLog,
  normalizeGymSession,
} from '@/utils/trainingPerformanceUtils'

export type TrainingSessionMode = 'training' | 'rest' | 'day-off'

export type TrainingSessionSummary = {
  mode: TrainingSessionMode
  title: string
  subtitle: string
  workoutLabel?: string
  muscleGroup?: string
  exerciseCount: number
}

export type CurrentTrainingExerciseStatus =
  | 'not-started'
  | 'active'
  | 'logged'
  | 'complete'

export type CurrentTrainingExercise = {
  exerciseId: string
  name: string
  index: number
  totalExercises: number
  setSummary: string
  status: CurrentTrainingExerciseStatus
}

export type TrainingProgress = {
  completedExercises: number
  totalExercises: number
  percentage: number
}

type TrainingSessionSummaryInput = {
  selectedDay: number
  todayDay: number
  diaOffManual: boolean
  treino: Treino | null
}

function formatSeriePart(serie: Serie): string {
  const countLabel = `${serie.series} ${serie.tipo}`

  if (serie.tipo === 'BS' && serie.reps != null) {
    return `${countLabel} x${serie.reps}`
  }

  if (serie.tipo === 'CS' && serie.reps != null) {
    return `${countLabel} ${serie.reps}`
  }

  return countLabel
}

export function formatTrainingSetSummary(exercicio: Exercicio): string {
  return exercicio.series.map(formatSeriePart).join(' · ')
}

export function getTrainingSessionSummary(
  input: TrainingSessionSummaryInput,
): TrainingSessionSummary {
  const { selectedDay, todayDay, diaOffManual, treino } = input

  if (treino) {
    return {
      mode: 'training',
      title: `Treino ${treino.letra}`,
      subtitle: treino.grupoMuscular,
      workoutLabel: `Treino ${treino.letra} · ${treino.grupoMuscular}`,
      muscleGroup: treino.grupoMuscular,
      exerciseCount: treino.exercicios.length,
    }
  }

  if (selectedDay === todayDay && diaOffManual) {
    return {
      mode: 'day-off',
      title: 'Day Off',
      subtitle: 'Workout paused for today',
      exerciseCount: 0,
    }
  }

  return {
    mode: 'rest',
    title: 'Recovery Day',
    subtitle: 'No workout scheduled',
    exerciseCount: 0,
  }
}

function getExerciseLog(
  session: GymSession | undefined,
  exercicioId: string,
  exercicios: Exercicio[],
) {
  if (!session) return undefined
  const normalized = normalizeGymSession(session, exercicios)
  const log = normalized.logs.find((entry) => entry.exercicioId === exercicioId)
  if (!log) return undefined
  const exercicio = exercicios.find((ex) => ex.id === exercicioId)
  return migrateLegacyExerciseLog(log, exercicio)
}

function hasLoggedLoad(
  session: GymSession | undefined,
  exercicioId: string,
  exercicios: Exercicio[],
): boolean {
  const log = getExerciseLog(session, exercicioId, exercicios)
  if (!log) return false
  return isExerciseFullyLogged(log)
}

export function getTrainingProgress(
  exercicios: Exercicio[],
  session: GymSession | undefined,
): TrainingProgress {
  if (!session) {
    return {
      completedExercises: 0,
      totalExercises: exercicios.length,
      percentage: 0,
    }
  }

  const normalized = normalizeGymSession(session, exercicios)
  const completedSets = getCompletedSetCount(normalized)
  const totalSets = getTotalSetCount(normalized)
  const completedExercises = exercicios.filter((exercicio) =>
    hasLoggedLoad(session, exercicio.id, exercicios),
  ).length

  const percentage =
    totalSets === 0
      ? 0
      : Math.round((completedSets / totalSets) * 100)

  return {
    completedExercises,
    totalExercises: exercicios.length,
    percentage,
  }
}

export function getCurrentTrainingExercise(
  exercicios: Exercicio[],
  session: GymSession | undefined,
): CurrentTrainingExercise {
  const totalExercises = exercicios.length
  const currentSet = getCurrentSet(session, exercicios)

  if (currentSet) {
    const exercicio = exercicios[currentSet.exerciseIndex] ?? exercicios[0]
    const status: CurrentTrainingExerciseStatus =
      currentSet.status === 'complete'
        ? 'complete'
        : session
          ? 'active'
          : 'not-started'

    return {
      exerciseId: currentSet.exercicioId,
      name: currentSet.exerciseName,
      index: currentSet.exerciseIndex,
      totalExercises,
      setSummary: formatTrainingSetSummary(exercicio),
      status,
    }
  }

  const firstUnloggedIndex = exercicios.findIndex(
    (exercicio) => !hasLoggedLoad(session, exercicio.id, exercicios),
  )
  const index =
    firstUnloggedIndex === -1
      ? Math.max(totalExercises - 1, 0)
      : firstUnloggedIndex
  const exercicio = exercicios[index]

  return {
    exerciseId: exercicio.id,
    name: exercicio.nome,
    index,
    totalExercises,
    setSummary: formatTrainingSetSummary(exercicio),
    status: !session ? 'not-started' : firstUnloggedIndex === -1 ? 'complete' : 'active',
  }
}

export function getSuggestedLoad(
  previousLoadKg: number | null | undefined,
): number | null {
  if (previousLoadKg == null) return null
  if (previousLoadKg >= 20) return previousLoadKg + 2.5
  return previousLoadKg + 1
}

export function formatLoadKg(kg: number): string {
  return Number.isInteger(kg) ? `${kg} kg` : `${kg} kg`
}

export function getTodayLoadForExercise(
  exercicioId: string,
  session: GymSession | undefined,
  exercicios?: Exercicio[],
): number | null {
  if (!session) return null
  const log = getExerciseLog(session, exercicioId, exercicios ?? [])
  if (!log) return null
  const best = getExerciseBestSet(log)
  if (best) return best.loadKg
  return log.cargaKg ?? null
}

export type ExerciseLoadInfo = {
  todayLoadKg: number | null
  previousLoadKg: number | null
}

export function getExerciseLoadInfo(
  exercicioId: string,
  session: GymSession | undefined,
  currentDate: string,
  sessions: GymSession[],
  exercicios?: Exercicio[],
): ExerciseLoadInfo {
  return {
    todayLoadKg: getTodayLoadForExercise(exercicioId, session, exercicios),
    previousLoadKg: getPreviousLoadForExercise(
      exercicioId,
      currentDate,
      sessions,
      exercicios,
    ),
  }
}

export function getPreviousLoadForExercise(
  exercicioId: string,
  currentDate: string,
  sessions: GymSession[],
  exercicios?: Exercicio[],
): number | null {
  const previousLog = getPreviousExerciseLog(
    exercicioId,
    currentDate,
    sessions,
    exercicios,
  )
  if (!previousLog) return null
  const best = getExerciseBestSet(previousLog)
  if (best) return best.loadKg
  return previousLog.cargaKg ?? null
}

export function getPreviousBestSetDisplay(
  exercicioId: string,
  currentDate: string,
  sessions: GymSession[],
  exercicios?: Exercicio[],
): string | null {
  const previousLog = getPreviousExerciseLog(
    exercicioId,
    currentDate,
    sessions,
    exercicios,
  )
  if (!previousLog) return null
  const best = getExerciseBestSet(previousLog)
  if (best) return `${best.loadKg}kg x ${best.repsCompleted}`
  if (previousLog.cargaKg != null) return `${previousLog.cargaKg}kg`
  return null
}

export function getExerciseSetProgressLabel(
  exercicioId: string,
  session: GymSession | undefined,
  exercicios: Exercicio[],
): string {
  const log = getExerciseLog(session, exercicioId, exercicios)
  if (!log) return '0 sets'
  const completed = getExerciseCompletedSetCount(log)
  const total = log.sets?.length ?? log.plannedSets
  return `${total} sets · ${completed} concluídos`
}

export function getUpcomingTrainingExercises(
  exercicios: Exercicio[],
  currentIndex: number,
  limit = 3,
): Exercicio[] {
  return exercicios.slice(currentIndex + 1, currentIndex + 1 + limit)
}
