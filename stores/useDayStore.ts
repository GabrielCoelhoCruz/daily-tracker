import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CheckState = {
  checked: boolean;
  timestamp: number;
  /** Item pulado com motivo (design system v1.1 §8) — vira vazamento nomeado. */
  skipped?: boolean;
  skipReason?: string;
  /** Refeição feita parcialmente — conta como resolvida, com crédito parcial e vazamento leve. */
  partial?: boolean;
};

type SessaoCardio = {
  minutos: number;
  timestamp: number;
};

export type DayState = {
  checks: Record<string, CheckState>;
  diaOffManual: boolean;
  /** Overrides today's scheduled split (e.g. legs instead of arms). Resets daily. */
  treinoHojeId: string | null;
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
  skipCheck: (id: string, reason: string) => void;
  partialCheck: (id: string) => void;
  setDiaOff: (value: boolean) => void;
  setTreinoHoje: (treinoId: string | null) => void;
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
  treinoHojeId: null,
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
          // Toggle limpa qualquer skip anterior.
          return {
            checks: {
              ...state.checks,
              [id]: {
                checked: current?.skipped ? false : !current?.checked,
                timestamp: Date.now(),
              },
            },
          };
        }),

      skipCheck: (id: string, reason: string) =>
        set((state) => ({
          checks: {
            ...state.checks,
            [id]: {
              checked: false,
              skipped: true,
              skipReason: reason,
              timestamp: Date.now(),
            },
          },
        })),

      partialCheck: (id: string) =>
        set((state) => ({
          checks: {
            ...state.checks,
            [id]: {
              checked: true,
              partial: true,
              timestamp: Date.now(),
            },
          },
        })),

      setDiaOff: (value: boolean) => set({ diaOffManual: value }),

      setTreinoHoje: (treinoId: string | null) => set({ treinoHojeId: treinoId }),

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
          treinoHojeId: null,
          aguaMl: 0,
          chaMl: 0,
          sessoesCardio: [],
          ultimoReset: logicalDate ?? getLogicalDate(new Date()),
        }),
    }),
    {
      name: "day-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 → v1: sem mudança de schema (migração identidade).
      // Futuras migrações: adicionar casos por versão aqui.
      migrate: (persistedState) => persistedState as DayState & DayActions,
    }
  )
);
