import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { plano as planoPadrao, type Plano } from "@/data/plano";
import { treinos as treinosPadrao, type Treino } from "@/data/treinos";

export type PlanOrigin = "coach_import" | "manual_base";

type ProtocolState = {
  /** Plano importado do coach ou plano-base manual — sobrepõe o padrão. */
  customPlano: Plano | null;
  /** Treinos importados do coach — sobrepõem o catálogo padrão. */
  customTreinos: Treino[] | null;
  /** Origem do plano ativo — define rótulos ("Plano do coach" / "Plano-base manual"). */
  planOrigin: PlanOrigin | null;
  onboardingComplete: boolean;
  /** Horário do fechamento do dia (HH:MM). */
  closeoutTime: string;
  /** Refeição livre faz parte do plano (1x/semana). */
  freeMealEnabled: boolean;
};

type ProtocolActions = {
  setCustomPlano: (plano: Plano, origin?: PlanOrigin) => void;
  setCustomTreinos: (treinos: Treino[] | null) => void;
  clearCustomPlano: () => void;
  setMetas: (metas: {
    aguaMl?: number;
    chaMl?: number;
    cardioMin?: number;
  }) => void;
  setOnboardingComplete: (value: boolean) => void;
  setPlanPrefs: (prefs: {
    closeoutTime?: string;
    freeMealEnabled?: boolean;
  }) => void;
};

export const useProtocolStore = create<ProtocolState & ProtocolActions>()(
  persist(
    (set, get) => ({
      customPlano: null,
      customTreinos: null,
      planOrigin: null,
      onboardingComplete: false,
      closeoutTime: "21:00",
      freeMealEnabled: false,

      setCustomPlano: (plano, origin) =>
        set((state) => ({
          customPlano: plano,
          planOrigin: origin ?? state.planOrigin ?? "coach_import",
        })),

      setCustomTreinos: (treinos) =>
        set({ customTreinos: treinos && treinos.length > 0 ? treinos : null }),

      clearCustomPlano: () =>
        set({ customPlano: null, customTreinos: null, planOrigin: null }),

      // Metas editadas fora do import clonam o plano ativo para um custom.
      setMetas: ({ aguaMl, chaMl, cardioMin }) => {
        const base = get().customPlano ?? planoPadrao;
        set({
          customPlano: {
            ...base,
            metaHidratacao: {
              aguaMl: aguaMl ?? base.metaHidratacao.aguaMl,
              chaMl: chaMl ?? base.metaHidratacao.chaMl,
            },
            metaCardioMin: cardioMin ?? base.metaCardioMin,
          },
        });
      },

      setOnboardingComplete: (value) => set({ onboardingComplete: value }),

      setPlanPrefs: ({ closeoutTime, freeMealEnabled }) =>
        set((state) => ({
          closeoutTime: closeoutTime ?? state.closeoutTime,
          freeMealEnabled: freeMealEnabled ?? state.freeMealEnabled,
        })),
    }),
    {
      name: "protocol-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 → v1: sem mudança de schema (migração identidade).
      migrate: (persistedState) =>
        persistedState as ProtocolState & ProtocolActions,
    }
  )
);

/** Plano ativo fora de componentes React (utils, notificações, reset). */
export function getActivePlano(): Plano {
  return useProtocolStore.getState().customPlano ?? planoPadrao;
}

/** Plano ativo dentro de componentes React — re-renderiza ao importar plano. */
export function useActivePlano(): Plano {
  return useProtocolStore((s) => s.customPlano) ?? planoPadrao;
}

export function getActiveTreinos(): Treino[] {
  const customTreinos = useProtocolStore.getState().customTreinos;
  return customTreinos && customTreinos.length > 0 ? customTreinos : treinosPadrao;
}

export function useActiveTreinos(): Treino[] {
  return useProtocolStore((s) => s.customTreinos) ?? treinosPadrao;
}
