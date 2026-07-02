import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoricoDia = {
  data: string;
  completados: number;
  total: number;
  itensPerdidos: string[];
  /** Refeições marcadas como "Parcial" no fechamento — aderência parcial, não pulada. */
  refeicoesParciais?: number;
  executionScore?: number;
  closeoutSavedAt?: string;
  closeoutEvidence?: string;
  closeoutLeaks?: string[];
  dayNote?: string;
  /** Métricas congeladas no fechamento — alimentam o resumo semanal. */
  aguaMl?: number;
  metaAguaMl?: number;
  cardioMin?: number;
  metaCardioMin?: number;
  treinoAgendado?: boolean;
  treinoConcluido?: boolean;
  /**
   * Registro criado pelo rollover automático da meia-noite — nunca conta
   * como dia fechado (sem closeoutSavedAt) nem alimenta resumo semanal.
   */
  autoRollover?: boolean;
};

type HistoryState = {
  dias: Record<string, HistoricoDia>;
};

type HistoryActions = {
  salvarDia: (historico: HistoricoDia) => void;
  getDia: (data: string) => HistoricoDia | undefined;
};

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  persist(
    (set, get) => ({
      dias: {},

      salvarDia: (historico: HistoricoDia) =>
        set((state) => ({
          dias: {
            ...state.dias,
            [historico.data]: historico,
          },
        })),

      getDia: (data: string) => get().dias[data],
    }),
    {
      name: "history-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 → v1: sem mudança de schema (migração identidade).
      migrate: (persistedState) =>
        persistedState as HistoryState & HistoryActions,
    }
  )
);
