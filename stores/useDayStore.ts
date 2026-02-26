import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CheckState = {
  checked: boolean;
  timestamp: number;
};

type SessaoCardio = {
  minutos: number;
  timestamp: number;
};

export type DayState = {
  checks: Record<string, CheckState>;
  diaOffManual: boolean;
  aguaMl: number;
  chaMl: number;
  sessoesCardio: SessaoCardio[];
  refeicaoLivreUsada: boolean;
  refeicaoLivrePeriodoId: string | null;
  semanaRefeicaoLivre: string;
  ultimoReset: string;
};

type DayActions = {
  toggleCheck: (id: string) => void;
  setDiaOff: (value: boolean) => void;
  addAgua: (ml: number) => void;
  removeAgua: (ml: number) => void;
  addCha: (ml: number) => void;
  removeCha: (ml: number) => void;
  addSessaoCardio: (min: number) => void;
  removeSessaoCardio: (index: number) => void;
  usarRefeicaoLivre: (periodoId: string) => void;
  desfazerRefeicaoLivre: () => void;
  resetDay: (logicalDate?: string) => void;
};

import { getLogicalDate, getWeekIdForDate } from "@/utils/dateUtils";

const initialState: DayState = {
  checks: {},
  diaOffManual: false,
  aguaMl: 0,
  chaMl: 0,
  sessoesCardio: [],
  refeicaoLivreUsada: false,
  refeicaoLivrePeriodoId: null,
  semanaRefeicaoLivre: getWeekIdForDate(getLogicalDate(new Date())),
  ultimoReset: getLogicalDate(new Date()),
};

export const useDayStore = create<DayState & DayActions>()(
  persist(
    (set) => ({
      ...initialState,

      toggleCheck: (id: string) =>
        set((state) => {
          const current = state.checks[id];
          return {
            checks: {
              ...state.checks,
              [id]: {
                checked: !current?.checked,
                timestamp: Date.now(),
              },
            },
          };
        }),

      setDiaOff: (value: boolean) => set({ diaOffManual: value }),

      addAgua: (ml: number) =>
        set((state) => ({ aguaMl: state.aguaMl + ml })),

      removeAgua: (ml: number) =>
        set((state) => ({ aguaMl: Math.max(0, state.aguaMl - ml) })),

      addCha: (ml: number) =>
        set((state) => ({ chaMl: state.chaMl + ml })),

      removeCha: (ml: number) =>
        set((state) => ({ chaMl: Math.max(0, state.chaMl - ml) })),

      addSessaoCardio: (min: number) =>
        set((state) => ({
          sessoesCardio: [
            ...state.sessoesCardio,
            { minutos: min, timestamp: Date.now() },
          ],
        })),

      removeSessaoCardio: (index: number) =>
        set((state) => ({
          sessoesCardio: state.sessoesCardio.filter((_, i) => i !== index),
        })),

      usarRefeicaoLivre: (periodoId: string) =>
        set({
          refeicaoLivreUsada: true,
          refeicaoLivrePeriodoId: periodoId,
        }),

      desfazerRefeicaoLivre: () =>
        set({
          refeicaoLivreUsada: false,
          refeicaoLivrePeriodoId: null,
        }),

      // Note: refeicaoLivreUsada/refeicaoLivrePeriodoId/semanaRefeicaoLivre
      // are intentionally preserved here — free meal is weekly, reset in checkAndReset on week change.
      resetDay: (logicalDate?: string) =>
        set({
          checks: {},
          diaOffManual: false,
          aguaMl: 0,
          chaMl: 0,
          sessoesCardio: [],
          ultimoReset: logicalDate ?? getLogicalDate(new Date()),
        }),
    }),
    {
      name: "day-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
