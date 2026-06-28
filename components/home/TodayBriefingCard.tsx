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

  const actionAccent = isComplete
    ? theme.colors.semantic.success
    : theme.colors.primary.DEFAULT

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
      {/* ── Próxima Ação hero ── */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf={isComplete ? "checkmark.circle.fill" : "bolt.fill"}
            mci={isComplete ? "check-circle" : "lightning-bolt"}
            size={16}
            color={actionAccent}
          />
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: "700",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: actionAccent,
            }}
          >
            Próxima Ação
          </Text>
        </View>

        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 22,
            fontWeight: "700",
            color: isComplete
              ? theme.colors.semantic.success
              : theme.colors.onSurface.DEFAULT,
          }}
        >
          {nextAction.title}
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{nextAction.subtitle}</Text>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        }}
      />

      {/* ── Progresso do protocolo ── */}
      <View style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: "700",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Protocolo
          </Text>
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: "700",
              color: actionAccent,
            }}
          >
            {progress.percentage}%
          </Text>
        </View>

        {/* Barra de progresso */}
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: actionAccent,
              width: `${progress.percentage}%`,
            }}
          />
        </View>

        <Text style={{ ...theme.typography.footnote }}>
          {progress.completed} de {progress.total} concluídos
        </Text>
      </View>

      <Pressable
        onPress={onOpenChecklist}
        accessibilityRole="button"
        accessibilityLabel={nextAction.cta}
        style={{
          minHeight: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: withAlpha(actionAccent, 0.12),
          borderWidth: 1,
          borderColor: withAlpha(actionAccent, 0.2),
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            ...theme.typography.callout,
            color: actionAccent,
          }}
        >
          {nextAction.cta}
        </Text>
      </Pressable>
    </View>
  )
}
