import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { PrepInsight } from "@/utils/prepReviewUtils";

type PatternInsightCardProps = {
  insight: PrepInsight;
};

function getToneColors(tone: PrepInsight["tone"]) {
  switch (tone) {
    case "good":
      return {
        accent: theme.colors.semantic.success,
        bg: withAlpha(theme.colors.semantic.success, 0.1),
        sf: "checkmark.seal.fill" as const,
        mci: "check-decagram" as const,
      };
    case "warning":
      return {
        accent: theme.colors.semantic.warning,
        bg: withAlpha(theme.colors.semantic.warning, 0.1),
        sf: "exclamationmark.triangle.fill" as const,
        mci: "alert" as const,
      };
    default:
      return {
        accent: theme.colors.onSurface.variant,
        bg: withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
        sf: "chart.line.uptrend.xyaxis" as const,
        mci: "chart-line" as const,
      };
  }
}

export function PatternInsightCard({ insight }: PatternInsightCardProps) {
  const colors = getToneColors(insight.tone);

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: withAlpha(colors.accent, 0.2),
        padding: 16,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf={colors.sf}
          mci={colors.mci}
          size={16}
          color={colors.accent}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: colors.accent,
          }}
        >
          Padrão
        </Text>
      </View>
      <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
        {insight.title}
      </Text>
      <Text style={{ ...theme.typography.footnote }}>{insight.message}</Text>
    </View>
  );
}
