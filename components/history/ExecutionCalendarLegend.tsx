import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import type { ExecutionTone } from "@/utils/prepReviewUtils";

const LEGEND_ITEMS: { tone: ExecutionTone; label: string; color: string }[] = [
  {
    tone: "complete",
    label: "≥90%",
    color: theme.colors.semantic.success,
  },
  {
    tone: "strong",
    label: "75–89%",
    color: withAlpha(theme.colors.semantic.success, 0.72),
  },
  {
    tone: "warning",
    label: "50–74%",
    color: theme.colors.accent.DEFAULT,
  },
  {
    tone: "leak",
    label: "<50%",
    color: theme.colors.semantic.error,
  },
  {
    tone: "empty",
    label: "Sem fechamento",
    color: withAlpha(theme.colors.onSurface.DEFAULT, 0.12),
  },
];

export function ExecutionCalendarLegend() {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingHorizontal: 4,
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <View
          key={item.tone}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: item.color,
            }}
          />
          <Text style={{ ...theme.typography.caption }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
