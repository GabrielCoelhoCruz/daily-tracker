import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Gender = "male" | "female";

export type Objective =
  | "prep"
  | "cutting"
  | "offseason"
  | "manutencao"
  | "evolucao";

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  prep: "Prep para campeonato",
  cutting: "Cutting",
  offseason: "Off-season controlado",
  manutencao: "Manutenção",
  evolucao: "Acompanhar evolução",
};

export type ExperienceLevel =
  | "iniciante"
  | "intermediario"
  | "avancado"
  | "competidor";

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
  competidor: "Competidor",
};

export type CheckInMode = "quick" | "full";

type AthleteState = {
  name: string;
  gender: Gender | "";
  heightCm: number;
  currentWeightKg: number;
  phase: string;
  /** Data do campeonato/meta (ISO yyyy-mm-dd) — usada para semanas restantes. */
  showDate: string;
  coachName: string;
  competitiveExperience: string;
  /** Objetivo atual — muda contexto do painel e das revisões. */
  objective: Objective | "";
  experienceLevel: ExperienceLevel | "";
  hasCoach: boolean;
  coachContact: string;
  coachNotes: string;
  /** Dia preferido do check-in (0=Dom … 6=Sáb). */
  checkInDay: number;
  /** Rápido: 1 foto · Completo: 4 fotos. */
  checkInMode: CheckInMode;
};

type AthleteActions = {
  updateProfile: (updates: Partial<AthleteState>) => void;
  isProfileComplete: () => boolean;
};

export const useAthleteStore = create<AthleteState & AthleteActions>()(
  persist(
    (set, get) => ({
      name: "",
      gender: "",
      heightCm: 0,
      currentWeightKg: 0,
      phase: "",
      showDate: "",
      coachName: "",
      competitiveExperience: "",
      objective: "",
      experienceLevel: "",
      hasCoach: false,
      coachContact: "",
      coachNotes: "",
      checkInDay: 0,
      checkInMode: "quick",

      updateProfile: (updates) => set(updates),

      isProfileComplete: () => {
        const { name, gender, heightCm, currentWeightKg } = get();
        return (
          name.trim().length > 0 &&
          (gender === "male" || gender === "female") &&
          heightCm >= 140 &&
          heightCm <= 220 &&
          currentWeightKg >= 40 &&
          currentWeightKg <= 180
        );
      },
    }),
    {
      name: "athlete-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 → v1: sem mudança de schema (migração identidade).
      migrate: (persistedState) =>
        persistedState as AthleteState & AthleteActions,
    }
  )
);
