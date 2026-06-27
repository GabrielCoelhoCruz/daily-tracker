import type { Exercicio, Serie, Treino } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'

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

function hasLoggedLoad(
  session: GymSession | undefined,
  exercicioId: string,
): boolean {
  if (!session) return false
  const log = session.logs.find((entry) => entry.exercicioId === exercicioId)
  return log?.cargaKg != null
}

export function getTrainingProgress(
  exercicios: Exercicio[],
  session: GymSession | undefined,
): TrainingProgress {
  const totalExercises = exercicios.length
  const completedExercises = exercicios.filter((exercicio) =>
    hasLoggedLoad(session, exercicio.id),
  ).length

  const percentage =
    totalExercises === 0
      ? 0
      : Math.round((completedExercises / totalExercises) * 100)

  return {
    completedExercises,
    totalExercises,
    percentage,
  }
}

export function getCurrentTrainingExercise(
  exercicios: Exercicio[],
  session: GymSession | undefined,
): CurrentTrainingExercise {
  const totalExercises = exercicios.length
  const firstUnloggedIndex = exercicios.findIndex(
    (exercicio) => !hasLoggedLoad(session, exercicio.id),
  )

  const index =
    firstUnloggedIndex === -1
      ? Math.max(totalExercises - 1, 0)
      : firstUnloggedIndex

  const exercicio = exercicios[index]
  const status: CurrentTrainingExerciseStatus = (() => {
    if (!session) return 'not-started'
    if (firstUnloggedIndex === -1) return 'complete'
    if (firstUnloggedIndex === 0) return 'active'
    return 'active'
  })()

  return {
    exerciseId: exercicio.id,
    name: exercicio.nome,
    index,
    totalExercises,
    setSummary: formatTrainingSetSummary(exercicio),
    status,
  }
}

export function getSuggestedLoad(
  previousLoadKg: number | null | undefined,
): number | null {
  if (previousLoadKg == null) return null
  if (previousLoadKg >= 20) return previousLoadKg + 2.5
  return previousLoadKg + 1
}

export function getPreviousLoadForExercise(
  exercicioId: string,
  currentDate: string,
  sessions: GymSession[],
): number | null {
  const priorSessions = sessions
    .filter((session) => session.date < currentDate)
    .sort((a, b) => b.date.localeCompare(a.date))

  for (const session of priorSessions) {
    const log = session.logs.find((entry) => entry.exercicioId === exercicioId)
    if (log?.cargaKg != null) {
      return log.cargaKg
    }
  }

  return null
}

export function getUpcomingTrainingExercises(
  exercicios: Exercicio[],
  currentIndex: number,
  limit = 3,
): Exercicio[] {
  return exercicios.slice(currentIndex + 1, currentIndex + 1 + limit)
}
