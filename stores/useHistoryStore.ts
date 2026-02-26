import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoricoDia = {
  data: string;
  completados: number;
  total: number;
  itensPerdidos: string[];
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
    }
  )
);
