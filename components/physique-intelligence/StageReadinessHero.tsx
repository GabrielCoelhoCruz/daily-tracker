import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { PhysiqueIntelligenceSummary } from "@/utils/physiqueIntelligenceUtils";

type StageReadinessHeroProps = {
  summary: PhysiqueIntelligenceSummary;
  onPress?: () => void;
};

function getReadinessColor(tone: PhysiqueIntelligenceSummary["stageReadinessTone"]) {
  switch (tone) {
    case "ready":
      return theme.colors.semantic.success;
    case "close":
    case "progressing":
      return theme.colors.primary.DEFAULT;
    case "far":
      return theme.colors.semantic.warning;
    default:
      return theme.colors.onSurface.variant;
  }
}

export function StageReadinessHero({ summary, onPress }: StageReadinessHeroProps) {
  const hasScores =
    summary.stageReadinessLabel != null ||
    summary.overallConditioning != null ||
    summary.vTaper != null;
  const accent = getReadinessColor(summary.stageReadinessTone);

  const scoreParts: string[] = [];
  if (summary.overallConditioning != null) {
    scoreParts.push(`Conditioning ${summary.overallConditioning}/10`);
  }
  if (summary.vTaper != null) {
    scoreParts.push(`V-Taper ${summary.vTaper}/10`);
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasScores
          ? `Stage readiness: ${summary.stageReadinessLabel}. ${scoreParts.join(", ")}`
          : "Stage readiness analysis pending"
      }
      accessibilityState={{ disabled: !onPress }}
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.18),
        padding: 22,
        gap: 10,
        minHeight: 44,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="figure.strengthtraining.traditional"
          mci="weight-lifter"
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
          Stage Readiness
        </Text>
      </View>

      <Text
        style={{
          ...theme.typography.headline,
          fontSize: 24,
          color: hasScores ? accent : theme.colors.onSurface.variant,
        }}
      >
        {hasScores ? summary.stageReadinessLabel : "Analysis pending"}
      </Text>

      <Text style={{ ...theme.typography.footnote }}>
        {hasScores
          ? scoreParts.join(" · ")
          : "Create or open a check-in to generate scores."}
      </Text>
    </Pressable>
  );
}
