// Legacy/demo analysis output, intentionally hidden from MVP UI (not rendered by any routed screen).
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

export function StageReadinessHero({
  summary,
  onPress,
}: StageReadinessHeroProps) {
  const hasScores =
    summary.stageReadinessLabel != null ||
    summary.overallConditioning != null ||
    summary.vTaper != null;
  const accent = getReadinessColor(summary.stageReadinessTone);

  const scoreParts: string[] = [];
  if (summary.overallConditioning != null) {
    scoreParts.push(`Condicionamento ${summary.overallConditioning}/10`);
  }
  if (summary.vTaper != null) {
    scoreParts.push(`V-Taper ${summary.vTaper}/10`);
  }

  const readinessTitle =
    summary.stageReadinessLabel ?? (hasScores ? "Scores disponíveis" : "Análise pendente");

  const scoreDetail = hasScores
    ? scoreParts.length > 0
      ? scoreParts.join(" · ")
      : "Abra o último check-in para ver os scores completos."
    : "Crie ou abra um check-in para gerar scores.";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasScores
          ? `Prontidão para o palco: ${readinessTitle}. ${scoreParts.join(", ")}`
          : "Análise de prontidão pendente"
      }
      accessibilityState={{ disabled: !onPress }}
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.18),
        padding: 22,
        minHeight: 44,
      }}
    >
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf="figure.strengthtraining.traditional"
            mci="weight-lifter"
            size={16}
            color={theme.colors.onSurface.variant}
          />
          <Text
            style={{
              ...theme.typography.overline,
            }}
          >
            Prontidão para o Palco
          </Text>
        </View>

        <Text
          style={{
            ...theme.typography.headline,
            fontSize: 24,
            color: hasScores ? accent : theme.colors.onSurface.variant,
          }}
        >
          {readinessTitle}
        </Text>

        <Text style={{ ...theme.typography.footnote }}>{scoreDetail}</Text>
      </View>
    </Pressable>
  );
}
