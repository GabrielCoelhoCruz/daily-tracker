import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { Exercicio } from "@/data/treinos";
import type { GymSession } from "@/stores/slices/gymLogSlice";
import type { TrainingProgress } from "@/utils/trainingSessionUtils";

type TrainingProgressRailProps = {
  progress: TrainingProgress;
  exercicios: Exercicio[];
  session: GymSession | undefined;
  currentIndex: number;
};

type DotState = "completed" | "active" | "pending";

function getDotState(
  exercicioId: string,
  index: number,
  currentIndex: number,
  session: GymSession | undefined,
): DotState {
  const log = session?.logs.find((entry) => entry.exercicioId === exercicioId);
  if (log?.cargaKg != null) return "completed";
  if (index === currentIndex) return "active";
  return "pending";
}

export function TrainingProgressRail({
  progress,
  exercicios,
  session,
  currentIndex,
}: TrainingProgressRailProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <AppIcon
          sf="chart.bar.fill"
          mci="chart-bar"
          size={16}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: withAlpha(theme.colors.onSurface.variant, 0.85),
          }}
        >
          Session Progress
        </Text>
      </View>

      <Text
        style={{
          ...theme.typography.footnote,
          color: theme.colors.onSurface.variant,
          marginBottom: 12,
        }}
      >
        {progress.completedExercises} of {progress.totalExercises} exercises
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {exercicios.map((exercicio, index) => {
          const state = getDotState(
            exercicio.id,
            index,
            currentIndex,
            session,
          );

          const dotColor =
            state === "completed"
              ? theme.colors.primary.DEFAULT
              : state === "active"
                ? theme.colors.primary.container
                : withAlpha(theme.colors.onSurface.variant, 0.25);

          const dotSize = state === "active" ? 10 : 8;

          return (
            <View
              key={exercicio.id}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                borderWidth: state === "active" ? 1 : 0,
                borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.5),
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
