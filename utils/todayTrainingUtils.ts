import type { Treino } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  formatVolumeKg,
  getCompletedSetCount,
  getCurrentSet,
  getSessionVolume,
  getTotalSetCount,
  normalizeGymSession,
} from '@/utils/trainingPerformanceUtils'

export type TodayTrainingStatus =
  | 'no-training'
  | 'pending'
  | 'in-progress'
  | 'complete'
  | 'incomplete'

export type TodayTrainingBriefing = {
  status: TodayTrainingStatus
  title: string
  subtitle: string
  nextActionLabel: string | null
  completedSets: number
  totalSets: number
  volumeKg: number
  currentExerciseName: string | null
  currentSetLabel: string | null
  isLeak: boolean
  workoutLabel: string | null
}

export type TodayTrainingBriefingInput = {
  isTrainingDay: boolean
  diaOffManual: boolean
  treino: Treino | null
  session: GymSession | undefined
}

function formatWorkoutLabel(treino: Treino): string {
  return `Treino ${treino.letra} · ${treino.grupoMuscular}`
}

function formatSetsSubtitle(completedSets: number, totalSets: number): string {
  return `${completedSets}/${totalSets} sets concluídos`
}

function formatCurrentSetLabel(
  exerciseName: string,
  setNumber: number,
): string {
  return `${exerciseName} · Set ${setNumber}`
}

export function getTodayTrainingExecutionStatus(
  input: TodayTrainingBriefingInput,
): TodayTrainingStatus {
  return getTodayTrainingBriefing(input).status
}

export function getTodayTrainingNextAction(
  briefing: TodayTrainingBriefing,
): string | null {
  return briefing.nextActionLabel
}

export function getTodayTrainingBriefing(
  input: TodayTrainingBriefingInput,
): TodayTrainingBriefing {
  const { isTrainingDay, diaOffManual, treino, session } = input

  if (diaOffManual) {
    return {
      status: 'no-training',
      title: 'Dia Off',
      subtitle: 'Treino pausado para hoje',
      nextActionLabel: null,
      completedSets: 0,
      totalSets: 0,
      volumeKg: 0,
      currentExerciseName: null,
      currentSetLabel: null,
      isLeak: false,
      workoutLabel: null,
    }
  }

  if (!isTrainingDay || !treino) {
    return {
      status: 'no-training',
      title: 'Dia de Recuperação',
      subtitle: 'Nenhum treino agendado',
      nextActionLabel: null,
      completedSets: 0,
      totalSets: 0,
      volumeKg: 0,
      currentExerciseName: null,
      currentSetLabel: null,
      isLeak: false,
      workoutLabel: null,
    }
  }

  const workoutLabel = formatWorkoutLabel(treino)

  if (!session) {
    return {
      status: 'pending',
      title: 'Treino pendente',
      subtitle: workoutLabel,
      nextActionLabel: 'Iniciar treino',
      completedSets: 0,
      totalSets: 0,
      volumeKg: 0,
      currentExerciseName: null,
      currentSetLabel: null,
      isLeak: false,
      workoutLabel,
    }
  }

  const normalized = normalizeGymSession(session, treino.exercicios)
  const completedSets = getCompletedSetCount(normalized)
  const totalSets = getTotalSetCount(normalized)
  const volumeKg = getSessionVolume(normalized)
  const currentSet = getCurrentSet(normalized, treino.exercicios)
  const allSetsComplete = totalSets > 0 && completedSets >= totalSets
  const isClosedPartial =
    normalized.completedAt != null && !allSetsComplete

  if (isClosedPartial) {
    const pendingSets = totalSets - completedSets
    return {
      status: 'incomplete',
      title: 'Vazamento no treino',
      subtitle: `${completedSets}/${totalSets} sets registrados`,
      nextActionLabel: 'Continuar treino',
      completedSets,
      totalSets,
      volumeKg,
      currentExerciseName: currentSet?.exerciseName ?? null,
      currentSetLabel:
        currentSet && currentSet.status !== 'complete'
          ? formatCurrentSetLabel(
              currentSet.exerciseName,
              currentSet.set.setNumber,
            )
          : null,
      isLeak: true,
      workoutLabel,
    }
  }

  if (allSetsComplete) {
    return {
      status: 'complete',
      title: 'Treino completo',
      subtitle: `${completedSets}/${totalSets} sets · ${formatVolumeKg(volumeKg)} volume`,
      nextActionLabel: 'Revisar treino',
      completedSets,
      totalSets,
      volumeKg,
      currentExerciseName: null,
      currentSetLabel: null,
      isLeak: false,
      workoutLabel,
    }
  }

  return {
    status: 'in-progress',
    title: 'Treino em andamento',
    subtitle: formatSetsSubtitle(completedSets, totalSets),
    nextActionLabel: 'Continuar treino',
    completedSets,
    totalSets,
    volumeKg,
    currentExerciseName: currentSet?.exerciseName ?? null,
    currentSetLabel:
      currentSet && currentSet.status !== 'complete'
        ? formatCurrentSetLabel(
            currentSet.exerciseName,
            currentSet.set.setNumber,
          )
        : null,
    isLeak: false,
    workoutLabel,
  }
}

export function isTodayTrainingComplete(briefing: TodayTrainingBriefing): boolean {
  return briefing.status === 'complete'
}

export function needsTodayTrainingAction(briefing: TodayTrainingBriefing): boolean {
  return (
    briefing.status === 'pending' ||
    briefing.status === 'in-progress' ||
    briefing.status === 'incomplete'
  )
}

export function formatTodayTrainingEvidence(
  briefing: TodayTrainingBriefing,
): string | null {
  if (briefing.status === 'no-training' || briefing.status === 'pending') {
    return null
  }

  if (briefing.totalSets === 0) {
    return briefing.volumeKg > 0
      ? formatVolumeKg(briefing.volumeKg)
      : null
  }

  return `${briefing.completedSets}/${briefing.totalSets} sets · ${formatVolumeKg(briefing.volumeKg)} volume`
}
