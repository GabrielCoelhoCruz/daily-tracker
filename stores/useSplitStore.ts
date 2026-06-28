import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  DEFAULT_SPLIT_WEEK_PLAN,
  normalizeSplitWeekPlan,
  setWeekDaySlotInPlan,
  type SplitWeekPlan,
  type WeekDaySlot,
} from '@/utils/splitWeekUtils'

export type SplitWeekState = {
  splitWeekPlan: SplitWeekPlan
}

export type SplitWeekActions = {
  setWeekDaySlot: (dayOfWeek: number, slot: WeekDaySlot) => void
  resetSplitWeekPlan: () => void
}

export const useSplitStore = create<SplitWeekState & SplitWeekActions>()(
  persist(
    (set) => ({
      splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN,

      setWeekDaySlot: (dayOfWeek, slot) =>
        set((state) => ({
          splitWeekPlan: setWeekDaySlotInPlan(state.splitWeekPlan, dayOfWeek, slot),
        })),

      resetSplitWeekPlan: () => set({ splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN }),
    }),
    {
      name: 'split-week-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SplitWeekState> | undefined
        return {
          ...current,
          splitWeekPlan: normalizeSplitWeekPlan(persistedState?.splitWeekPlan),
        }
      },
    },
  ),
)
