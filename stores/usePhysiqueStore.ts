import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ATHLETE_NAME = "Gabriel Cruz";
export const ATHLETE_AGE = 26;
export const ATHLETE_HEIGHT = "1.72m";
export const ATHLETE_PHASE = "Cutting";

export const PHOTO_LABELS = ["Frontal", "Lateral", "Costas", "Extra"] as const;

export const MODE_LABELS: Record<PhysiqueCheckIn["mode"], string> = {
  full: "Completa",
  comparative: "Comparativa",
  quick: "Quick",
  posing: "Posing",
};

export type TargetCategory =
  | "mens_physique"
  | "classic_physique"
  | "bodybuilding"
  | "undecided";

export type PhysiqueCheckIn = {
  id: string;
  week: number;
  date: string;
  weight: number;
  previousWeight?: number;
  notes?: string;
  photoPaths: string[];
  analysis?: string;
  mode: "full" | "comparative" | "quick" | "posing";
  targetCategory?: TargetCategory;
  weeksToCompetition?: number;
  scores?: {
    overallConditioning?: number;
    stageReadiness?: number;
    vTaper?: number;
  };
};

type PhysiqueState = {
  checkIns: PhysiqueCheckIn[];
  lastCategory: TargetCategory;
};

type PhysiqueActions = {
  addCheckIn: (checkIn: Omit<PhysiqueCheckIn, "id">) => string;
  updateAnalysis: (id: string, analysis: string) => void;
  setLastCategory: (category: TargetCategory) => void;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePhysiqueStore = create<PhysiqueState & PhysiqueActions>()(
  persist(
    (set) => ({
      checkIns: [],
      lastCategory: "undecided" as TargetCategory,

      addCheckIn: (checkIn) => {
        const id = generateId();
        set((state) => ({
          checkIns: [...state.checkIns, { ...checkIn, id }],
          lastCategory: checkIn.targetCategory ?? state.lastCategory,
        }));
        return id;
      },

      updateAnalysis: (id, analysis) =>
        set((state) => ({
          checkIns: state.checkIns.map((c) =>
            c.id === id ? { ...c, analysis } : c
          ),
        })),

      setLastCategory: (category) => set({ lastCategory: category }),
    }),
    {
      name: "physique-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
