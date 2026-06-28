import { Pressable, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import type { RecentDaySummary } from "@/utils/prepReviewUtils";

type DaySummaryRowProps = {
  summary: RecentDaySummary;
  onPress: (date: string) => void;
};

function getToneColor(tone: RecentDaySummary["tone"]): string {
  switch (tone) {
    case "complete":
    case "perfect":
    case "strong":
      return theme.colors.semantic.success;
    case "warning":
    case "partial":
      return theme.colors.accent.DEFAULT;
    case "leak":
    case "weak":
      return theme.colors.semantic.error;
    default:
      return theme.colors.onSurface.variant;
  }
}

export function DaySummaryRow({ summary, onPress }: DaySummaryRowProps) {
  const handlePress = () => onPress(summary.date);
  const color = getToneColor(summary.tone);

  const valueText = summary.inProgress
    ? "Em andamento"
    : summary.hasCloseout && summary.executionScore != null
      ? `${summary.executionScore}%`
      : summary.percentage !== null
        ? `${summary.percentage}%`
        : "—";

  const detailText = summary.primaryLeak
    ? summary.primaryLeak
    : summary.evidenceShort
      ? summary.evidenceShort
      : summary.total > 0
        ? `${summary.completed} de ${summary.total}`
        : undefined;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir registro de ${summary.label}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 4,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...theme.typography.body, fontWeight: "500" }}>
          {summary.label}
        </Text>
        {detailText ? (
          <Text
            numberOfLines={1}
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            {detailText}
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
          color,
        }}
      >
        {valueText}
      </Text>
    </Pressable>
  );
}
