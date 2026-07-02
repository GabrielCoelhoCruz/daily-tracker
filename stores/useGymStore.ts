import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createGymLogSlice,
  type GymLogActions,
  type GymLogState,
  type GymExercise,
  type ExerciseLog,
  type GymSession,
} from './slices/gymLogSlice'

export type { GymExercise, ExerciseLog, GymSession, GymLogState, GymLogActions }

export const useGymStore = create<GymLogState & GymLogActions>()(
  persist(
    (...a) => ({ ...createGymLogSlice(...a) }),
    {
      name: 'gym-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 → v1: sem mudança de schema (migração identidade).
      migrate: (persistedState) =>
        persistedState as GymLogState & GymLogActions,
    },
  ),
)
