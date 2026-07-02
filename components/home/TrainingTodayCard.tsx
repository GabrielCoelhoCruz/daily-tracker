import { Pressable, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import type { TodayTrainingBriefing } from "@/utils/todayTrainingUtils"
import { formatTodayTrainingEvidence } from "@/utils/todayTrainingUtils"

type TrainingTodayCardProps = {
  briefing: TodayTrainingBriefing
}

function getStatusAccent(status: TodayTrainingBriefing["status"]): string {
  switch (status) {
    case "complete":
      return theme.colors.semantic.success
    case "incomplete":
      return theme.colors.semantic.error
    case "in-progress":
      return theme.colors.primary.DEFAULT
    case "pending":
      return theme.colors.primary.container
    default:
      return theme.colors.onSurface.variant
  }
}

export function TrainingTodayCard({ briefing }: TrainingTodayCardProps) {
  const router = useRouter()
  const hasTraining = briefing.status !== "no-training"
  const accent = getStatusAccent(briefing.status)
  const evidence = formatTodayTrainingEvidence(briefing)

  function handleTrainingAction() {
    router.push("/(tabs)/(treino)")
  }

  if (!hasTraining) {
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
            sf="moon.fill"
            mci="moon-waning-crescent"
            size={18}
            color={theme.colors.onSurface.variant}
          />
          <Text style={{ ...theme.typography.overline }}>Treino de hoje</Text>
        </View>
        <Text style={{ ...theme.typography.title3, fontSize: 18 }}>
          {briefing.title}
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{briefing.subtitle}</Text>
      </View>
    )
  }

  return (
    <View
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, briefing.isLeak ? 0.35 : 0.15),
        padding: 20,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppIcon
          sf="dumbbell.fill"
          mci="dumbbell"
          size={18}
          color={accent}
        />
        <Text style={{ ...theme.typography.overline, color: accent }}>
          Treino de hoje
        </Text>
      </View>

      {/* Em estados como "pendente" o subtitle repete o workoutLabel; mostrar
          os dois imprime "Treino D · Ombros" duas vezes no mesmo card. */}
      {briefing.workoutLabel && briefing.workoutLabel !== briefing.subtitle && (
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.onSurface.variant,
          }}
        >
          {briefing.workoutLabel}
        </Text>
      )}

      <View style={{ gap: 4 }}>
        <Text style={{ ...theme.typography.title3, fontSize: 18 }}>
          {briefing.title}
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{briefing.subtitle}</Text>
      </View>

      {evidence && (
        <View
          style={{
            backgroundColor: theme.colors.surface.container,
            borderRadius: theme.radius.lg,
            padding: 12,
            gap: 4,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          }}
        >
          <Text style={{ ...theme.typography.overline }}>Evidência</Text>
          <Text style={{ ...theme.typography.body, fontWeight: "600" }}>
            {evidence}
          </Text>
        </View>
      )}

      {briefing.currentSetLabel && briefing.status === "in-progress" && (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Continuar
          </Text>
          <Text
            style={{
              ...theme.typography.body,
              fontWeight: "700",
              color: theme.colors.primary.DEFAULT,
            }}
          >
            {briefing.currentSetLabel}
          </Text>
        </View>
      )}

      {briefing.nextActionLabel && (
        <View style={{ gap: 8 }}>
          <Text style={{ ...theme.typography.overline }}>Próxima ação</Text>
          <Pressable
            onPress={handleTrainingAction}
            accessibilityRole="button"
            accessibilityLabel={briefing.nextActionLabel}
            style={({ pressed }) => ({
              minHeight: 48,
              borderRadius: theme.radius.lg,
              backgroundColor: withAlpha(accent, 0.15),
              borderWidth: 1,
              borderColor: withAlpha(accent, 0.25),
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={{
                ...theme.typography.callout,
                fontWeight: "700",
                color: accent,
              }}
            >
              {briefing.nextActionLabel}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
