import { Pressable, Text, View } from "react-native"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import { HeroGlow } from "@/components/ui/HeroGlow"
import { HeroRing } from "@/components/ui/HeroRing"
import type { HomeAction, ProtocolProgress } from "@/utils/homeUtils"

type TodayBriefingCardProps = {
  progress: ProtocolProgress
  nextAction: HomeAction
  onOpenChecklist: () => void
}

/**
 * Hoje hero — the day's instrument gauge. Floats on an atmospheric glow
 * instead of sitting in a card; the ring is the screen's focal point.
 */
export function TodayBriefingCard({
  progress,
  nextAction,
  onOpenChecklist,
}: TodayBriefingCardProps) {
  const isComplete =
    nextAction.type === "complete" || nextAction.type === "closeout"

  const actionAccent = isComplete
    ? theme.colors.semantic.success
    : theme.colors.primary.DEFAULT

  return (
    <View style={{ paddingTop: 12, paddingBottom: 4 }}>
      <HeroGlow color={actionAccent} />

      <HeroRing
        percentage={progress.percentage}
        accent={actionAccent}
        label="Protocolo"
        caption={`${progress.completed} de ${progress.total} concluídos`}
      />

      {/* ── Próxima ação ── */}
      <View style={{ alignItems: "center", gap: 6, marginTop: 26 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf={isComplete ? "checkmark.circle.fill" : "bolt.fill"}
            mci={isComplete ? "check-circle" : "lightning-bolt"}
            size={14}
            color={actionAccent}
          />
          <Text style={{ ...theme.typography.overline, color: actionAccent }}>
            Próxima Ação
          </Text>
        </View>

        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 26,
            fontWeight: "800",
            letterSpacing: -0.8,
            textAlign: "center",
            color: isComplete
              ? theme.colors.semantic.success
              : theme.colors.onSurface.DEFAULT,
          }}
        >
          {nextAction.title}
        </Text>
        <Text
          style={{
            ...theme.typography.footnote,
            textAlign: "center",
          }}
        >
          {nextAction.subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onOpenChecklist}
        accessibilityRole="button"
        accessibilityLabel={nextAction.cta}
        style={({ pressed }) => ({
          minHeight: 50,
          marginTop: 18,
          borderRadius: 25,
          backgroundColor: isComplete
            ? withAlpha(actionAccent, 0.14)
            : actionAccent,
          borderWidth: 1,
          borderColor: isComplete ? withAlpha(actionAccent, 0.3) : "transparent",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <Text
          style={{
            ...theme.typography.callout,
            fontWeight: "700",
            color: isComplete ? actionAccent : "#1a1205",
          }}
        >
          {nextAction.cta}
        </Text>
      </Pressable>
    </View>
  )
}
