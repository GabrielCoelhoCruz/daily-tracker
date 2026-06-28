import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import {
  FocalExercicioCard,
  ExercicioItem,
} from "@/components/treino/ExercicioItem";
import { ExerciseLoadBadge } from "@/components/training/ExerciseLoadBadge";
import type { Exercicio } from "@/data/treinos";
import type { GymSession } from "@/stores/slices/gymLogSlice";
import { isExerciseFullyLogged, migrateLegacyExerciseLog } from "@/utils/trainingPerformanceUtils";
import { getExerciseLoadInfo } from "@/utils/trainingSessionUtils";

type ExerciseProtocolListProps = {
  exercicios: Exercicio[];
  currentIndex: number;
  session: GymSession | undefined;
  muscleGroup: string;
  currentDate: string;
  gymSessions: GymSession[];
};

type ExerciseState = "completed" | "current" | "pending";

function getExerciseState(
  exercicio: Exercicio,
  index: number,
  currentIndex: number,
  session: GymSession | undefined,
): ExerciseState {
  const log = session?.logs.find((entry) => entry.exercicioId === exercicio.id);
  if (log && isExerciseFullyLogged(migrateLegacyExerciseLog(log, exercicio))) {
    return "completed";
  }
  if (index === currentIndex) return "current";
  return "pending";
}

export function ExerciseProtocolList({
  exercicios,
  currentIndex,
  session,
  muscleGroup,
  currentDate,
  gymSessions,
}: ExerciseProtocolListProps) {
  return (
    <View style={{ marginTop: 8, marginBottom: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          paddingBottom: 12,
          marginBottom: 16,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: withAlpha(theme.colors.onSurface.variant, 0.6),
          }}
        >
          Protocolo completo
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.surface.containerHigh,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          }}
        >
          <Text
            style={{
              fontSize: 9,
              fontWeight: "900",
              color: theme.colors.onSurface.DEFAULT,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {muscleGroup}
          </Text>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {exercicios.map((exercicio, index) => {
          const state = getExerciseState(
            exercicio,
            index,
            currentIndex,
            session,
          );
          const loadInfo = getExerciseLoadInfo(
            exercicio.id,
            session,
            currentDate,
            gymSessions,
            exercicios,
          );

          if (state === "current") {
            return (
              <View key={exercicio.id} style={{ gap: 10 }}>
                <FocalExercicioCard
                  exercicio={exercicio}
                  index={index}
                />
                <ExerciseLoadBadge loadInfo={loadInfo} />
              </View>
            );
          }

          return (
            <View
              key={exercicio.id}
              style={{
                opacity: state === "completed" ? 0.65 : 1,
                gap: 8,
              }}
            >
              <ExercicioItem exercicio={exercicio} index={index} />
              <ExerciseLoadBadge loadInfo={loadInfo} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
