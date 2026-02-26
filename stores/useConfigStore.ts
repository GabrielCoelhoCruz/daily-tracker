import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotificacaoPeriodo = {
  enabled: boolean;
  horario: string;
};

type HidratacaoLembrete = {
  enabled: boolean;
  intervaloHoras: number;
};

type ConfigState = {
  notificacoesPorPeriodo: Record<string, NotificacaoPeriodo>;
  hidratacaoLembrete: HidratacaoLembrete;
};

type ConfigActions = {
  toggleNotificacaoPeriodo: (periodoId: string) => void;
  setHorarioPeriodo: (periodoId: string, horario: string) => void;
  toggleHidratacaoLembrete: () => void;
  setIntervaloHidratacao: (horas: number) => void;
};

const initialState: ConfigState = {
  notificacoesPorPeriodo: {},
  hidratacaoLembrete: {
    enabled: false,
    intervaloHoras: 2,
  },
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set) => ({
      ...initialState,

      toggleNotificacaoPeriodo: (periodoId: string) =>
        set((state) => {
          const current = state.notificacoesPorPeriodo[periodoId];
          return {
            notificacoesPorPeriodo: {
              ...state.notificacoesPorPeriodo,
              [periodoId]: {
                enabled: !current?.enabled,
                horario: current?.horario ?? "08:00",
              },
            },
          };
        }),

      setHorarioPeriodo: (periodoId: string, horario: string) =>
        set((state) => {
          const current = state.notificacoesPorPeriodo[periodoId];
          return {
            notificacoesPorPeriodo: {
              ...state.notificacoesPorPeriodo,
              [periodoId]: {
                enabled: current?.enabled ?? false,
                horario,
              },
            },
          };
        }),

      toggleHidratacaoLembrete: () =>
        set((state) => ({
          hidratacaoLembrete: {
            ...state.hidratacaoLembrete,
            enabled: !state.hidratacaoLembrete.enabled,
          },
        })),

      setIntervaloHidratacao: (horas: number) =>
        set((state) => ({
          hidratacaoLembrete: {
            ...state.hidratacaoLembrete,
            intervaloHoras: horas,
          },
        })),
    }),
    {
      name: "config-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
