import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { formatLogicalDate } from "@/utils/dateUtils";

type DayProgressSummaryProps = {
  completed: number;
  total: number;
  percentage: number;
};

export function DayProgressSummary({
  completed,
  total,
  percentage,
}: DayProgressSummaryProps) {
  const remaining = Math.max(0, total - completed);

  return (
    <View style={{ alignItems: "center", gap: 12, marginBottom: 8 }}>
      <Text
        style={{
          ...theme.typography.footnote,
          color: theme.colors.onSurface.variant,
          textAlign: "center",
        }}
      >
        {formatLogicalDate(new Date())}
      </Text>

      <View
        style={{
          width: "100%",
          maxWidth: 280,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: withAlpha(theme.colors.surface.container, 0.6),
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: theme.colors.onSurface.DEFAULT,
            }}
          >
            {completed} de {total} itens
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: theme.colors.primary.DEFAULT,
              fontVariant: ["tabular-nums"],
            }}
          >
            {remaining} restantes
          </Text>
        </View>

        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.surface.containerHighest,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${percentage}%`,
              borderRadius: 2,
              backgroundColor: theme.colors.primary.DEFAULT,
            }}
          />
        </View>
      </View>
    </View>
  );
}
