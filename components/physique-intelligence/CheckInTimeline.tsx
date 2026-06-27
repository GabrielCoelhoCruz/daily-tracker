import { Image, Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import type { CheckInTimelineItem } from "@/utils/physiqueIntelligenceUtils";

type CheckInTimelineProps = {
  items: CheckInTimelineItem[];
  onItemPress: (id: string) => void;
};

export function CheckInTimeline({ items, onItemPress }: CheckInTimelineProps) {
  if (items.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          ...theme.typography.caption,
          fontWeight: "700",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          paddingHorizontal: 4,
        }}
      >
        Timeline
      </Text>

      <View
        style={{
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface.container,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
          padding: 12,
          gap: 10,
        }}
      >
        {items.map((item) => {
          const weightLine =
            item.weightDeltaKg != null
              ? `${item.weightKg}kg · ${item.weightDeltaKg >= 0 ? "+" : ""}${item.weightDeltaKg}kg`
              : `${item.weightKg}kg`;

          return (
            <Pressable
              key={item.id}
              onPress={() => onItemPress(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Week ${item.week}, ${weightLine}, ${item.modeLabel}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: 44,
                paddingVertical: 4,
              }}
            >
              {item.thumbnailUri ? (
                <Image
                  source={{ uri: item.thumbnailUri }}
                  style={{
                    width: 48,
                    height: 64,
                    borderRadius: theme.radius.md,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 48,
                    height: 64,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.surface.containerHighest,
                  }}
                />
              )}

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ ...theme.typography.callout }}>
                  Week {item.week}
                </Text>
                <Text style={{ ...theme.typography.footnote }}>{weightLine}</Text>
                {item.stageReadinessLabel ? (
                  <Text style={{ ...theme.typography.caption, fontSize: 11 }}>
                    Stage: {item.stageReadinessLabel}
                  </Text>
                ) : null}
                <Text
                  style={{
                    ...theme.typography.caption,
                    fontSize: 11,
                    color: item.hasAnalysis
                      ? theme.colors.primary.DEFAULT
                      : theme.colors.onSurface.variant,
                  }}
                >
                  {item.modeLabel}
                  {!item.hasAnalysis ? " · Analysis pending" : ""}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
