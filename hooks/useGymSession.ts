import { useCallback } from 'react'
import type { Treino } from '@/data/treinos'
import { useGymStore } from '@/stores/useGymStore'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  resolveGymSessionForTreino,
  updateGymSessionCarga,
} from '@/utils/gymLogUtils'

export function useGymSessionForToday(treino: Treino | null, date: string) {
  const session = useGymStore((s) =>
    treino ? s.getActiveSessionForTreinoAndDate(treino.id, date) : undefined,
  )

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

  return { session, startSession, updateCarga, isLogging }
}
