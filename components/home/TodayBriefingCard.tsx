import { Pressable, Text, View } from "react-native"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import type { HomeAction, ProtocolProgress } from "@/utils/homeUtils"

type TodayBriefingCardProps = {
  progress: ProtocolProgress
  nextAction: HomeAction
  onOpenChecklist: () => void
}

export function TodayBriefingCard({
  progress,
  nextAction,
  onOpenChecklist,
}: TodayBriefingCardProps) {
  const isComplete = nextAction.type === "complete"

  return (
    <View
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 22,
        gap: 20,
      }}
    >
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf="chart.line.uptrend.xyaxis"
            mci="chart-line"
            size={16}
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
            Protocolo Diário
          </Text>
        </View>

        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          {progress.percentage}% completo
        </Text>
        <Text style={{ ...theme.typography.footnote }}>
          {progress.completed} de {progress.total} concluídos
        </Text>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        }}
      />

      <View style={{ gap: 8 }}>
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Próximo
        </Text>
        <Text
          style={{
            ...theme.typography.headline,
            color: isComplete
              ? theme.colors.semantic.success
              : theme.colors.onSurface.DEFAULT,
          }}
        >
          {nextAction.title}
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{nextAction.subtitle}</Text>
      </View>

      <Pressable
        onPress={onOpenChecklist}
        accessibilityRole="button"
        accessibilityLabel={nextAction.cta}
        style={{
          minHeight: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: withAlpha(
            isComplete
              ? theme.colors.semantic.success
              : theme.colors.primary.container,
            0.12
          ),
          borderWidth: 1,
          borderColor: withAlpha(
            isComplete
              ? theme.colors.semantic.success
              : theme.colors.primary.DEFAULT,
            0.2
          ),
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            ...theme.typography.callout,
            color: isComplete
              ? theme.colors.semantic.success
              : theme.colors.primary.DEFAULT,
          }}
        >
          {nextAction.cta}
        </Text>
      </Pressable>
    </View>
  )
}
