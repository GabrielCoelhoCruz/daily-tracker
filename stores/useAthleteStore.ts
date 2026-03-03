import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Gender = "male" | "female";

type AthleteState = {
  name: string;
  gender: Gender | "";
  heightCm: number;
  currentWeightKg: number;
  phase: string;
  coachName: string;
  competitiveExperience: string;
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
      coachName: "",
      competitiveExperience: "",

      updateProfile: (updates) => set(updates),

      isProfileComplete: () => {
        const { name, gender } = get();
        return name.trim().length > 0 && (gender === "male" || gender === "female");
      },
    }),
    {
      name: "athlete-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
