import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { DaySummaryRow } from "@/components/history/DaySummaryRow";
import type { RecentDaySummary } from "@/utils/prepReviewUtils";

type RecentDaysListProps = {
  days: RecentDaySummary[];
  onDayPress: (date: string) => void;
  title?: string;
};

export function RecentDaysList({
  days,
  onDayPress,
  title = "Dias recentes",
}: RecentDaysListProps) {
  if (days.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 4,
        }}
      >
        <AppIcon
          sf="clock.arrow.circlepath"
          mci="history"
          size={16}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.onSurface.variant,
          }}
        >
          {title}
        </Text>
      </View>

      <View
        style={{
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface.container,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}
      >
        {days.map((day, index) => (
          <View key={day.date}>
            <DaySummaryRow summary={day} onPress={onDayPress} />
            {index < days.length - 1 ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: withAlpha(
                    theme.colors.onSurface.DEFAULT,
                    0.06,
                  ),
                }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
