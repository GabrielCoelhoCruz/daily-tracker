import { Pressable, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import type { RecentDaySummary } from "@/utils/prepReviewUtils";

type DaySummaryRowProps = {
  summary: RecentDaySummary;
  onPress: (date: string) => void;
};

function getToneColor(tone: RecentDaySummary["tone"]): string {
  switch (tone) {
    case "perfect":
    case "strong":
      return theme.colors.semantic.success;
    case "partial":
      return theme.colors.primary.DEFAULT;
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
    : summary.percentage !== null
      ? `${summary.percentage}%`
      : "—";

  const detailText =
    summary.total > 0
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
      }}
    >
      <Text style={{ ...theme.typography.body, fontWeight: "500" }}>
        {summary.label}
      </Text>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
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
        {detailText ? (
          <Text
            style={{
              ...theme.typography.caption,
              fontVariant: ["tabular-nums"],
            }}
          >
            {detailText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
