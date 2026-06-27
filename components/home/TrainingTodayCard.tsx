import { Pressable, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import type { TodayWorkoutSummary } from "@/utils/homeUtils"

type TrainingTodayCardProps = {
  summary: TodayWorkoutSummary
}

export function TrainingTodayCard({ summary }: TrainingTodayCardProps) {
  const router = useRouter()
  const isTraining = summary.kind === "training"

  function handleStartWorkout() {
    router.push("/(tabs)/(treino)")
  }

  return (
    <View
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 20,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppIcon
          sf="dumbbell.fill"
          mci="dumbbell"
          size={18}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Treino de Hoje
        </Text>
      </View>

      <Text style={{ ...theme.typography.title3, fontSize: 18 }}>
        {summary.title}
      </Text>

      {isTraining ? (
        <Text style={{ ...theme.typography.footnote, lineHeight: 20 }}>
          {summary.subtitle}{" "}
          <Text style={{ color: theme.colors.onSurface.DEFAULT }}>
            {summary.firstExercise}
          </Text>
        </Text>
      ) : (
        <Text style={{ ...theme.typography.footnote }}>{summary.subtitle}</Text>
      )}

      {isTraining && (
        <Pressable
          onPress={handleStartWorkout}
          accessibilityRole="button"
          accessibilityLabel="Iniciar log de treino"
          style={{
            marginTop: 4,
            minHeight: 44,
            borderRadius: theme.radius.lg,
            backgroundColor: withAlpha(theme.colors.primary.container, 0.15),
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.2),
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              ...theme.typography.callout,
              color: theme.colors.primary.DEFAULT,
            }}
          >
            Iniciar Log de Treino
          </Text>
        </Pressable>
      )}
    </View>
  )
}
