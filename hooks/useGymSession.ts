import { useCallback } from 'react'
import type { Treino } from '@/data/treinos'
import { useGymStore } from '@/stores/useGymStore'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  resolveGymSessionForTreino,
  updateGymSessionCarga,
} from '@/utils/gymLogUtils'
import { normalizeGymSession } from '@/utils/trainingPerformanceUtils'

export function useGymSessionForToday(treino: Treino | null, date: string) {
  const session = useGymStore((s) =>
    treino ? s.getActiveSessionForTreinoAndDate(treino.id, date) : undefined,
  )

  const normalizedSession = session && treino
    ? normalizeGymSession(session, treino.exercicios)
    : session

  const isLogging = treino !== null

  const startSession = useCallback((): GymSession | undefined => {
    if (!treino) return undefined
    return resolveGymSessionForTreino(treino, date, useGymStore.getState())
  }, [treino, date])

  const updateCarga = useCallback(
    (exercicioId: string, cargaKg: number) => {
      const active = treino
        ? useGymStore
            .getState()
            .getActiveSessionForTreinoAndDate(treino.id, date)
        : undefined
      updateGymSessionCarga(active, exercicioId, cargaKg, useGymStore.getState())
    },
    [treino, date],
  )

  const updateSet = useCallback(
    (
      exercicioId: string,
      setId: string,
      updates: {
        loadKg?: number
        repsCompleted?: number
        isFailure?: boolean
      },
    ) => {
      const active = treino
        ? useGymStore
            .getState()
            .getActiveSessionForTreinoAndDate(treino.id, date)
        : undefined
      if (!active) return
      useGymStore
        .getState()
        .updateTrainingSetLog(active.id, exercicioId, setId, updates)
    },
    [treino, date],
  )

  const completeSet = useCallback(
    (
      exercicioId: string,
      setId: string,
      data?: {
        loadKg?: number
        repsCompleted?: number
        isFailure?: boolean
      },
    ) => {
      const active = treino
        ? useGymStore
            .getState()
            .getActiveSessionForTreinoAndDate(treino.id, date)
        : undefined
      if (!active) return
      useGymStore
        .getState()
        .completeTrainingSet(active.id, exercicioId, setId, data)
    },
    [treino, date],
  )

  const undoSet = useCallback(
    (exercicioId: string, setId: string) => {
      const active = treino
        ? useGymStore
            .getState()
            .getActiveSessionForTreinoAndDate(treino.id, date)
        : undefined
      if (!active) return
      useGymStore.getState().undoTrainingSet(active.id, exercicioId, setId)
    },
    [treino, date],
  )

  const finishSession = useCallback(() => {
    const active = treino
      ? useGymStore
          .getState()
          .getActiveSessionForTreinoAndDate(treino.id, date)
      : undefined
    if (!active) return
    useGymStore.getState().finishGymSession(active.id)
  }, [treino, date])

  return {
    session: normalizedSession,
    startSession,
    updateCarga,
    updateSet,
    completeSet,
    undoSet,
    finishSession,
    isLogging,
  }
}
