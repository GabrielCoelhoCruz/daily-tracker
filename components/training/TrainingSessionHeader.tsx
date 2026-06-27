import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { TrainingSessionSummary } from "@/utils/trainingSessionUtils";

type TrainingSessionHeaderProps = {
  summary: TrainingSessionSummary;
  isViewingToday: boolean;
  dayName: string;
};

export function TrainingSessionHeader({
  summary,
  isViewingToday,
  dayName,
}: TrainingSessionHeaderProps) {
  return (
    <View style={{ marginTop: 20, marginBottom: 24 }}>
      <Text
        style={{
          ...theme.typography.labelSmall,
          color: theme.colors.primary.container,
          marginBottom: 6,
        }}
      >
        {isViewingToday ? "Today" : dayName}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <AppIcon
          sf="dumbbell.fill"
          mci="dumbbell"
          size={22}
          color={theme.colors.primary.DEFAULT}
        />
        <Text style={theme.typography.titleLarge}>{summary.title}</Text>
      </View>

      <Text
        style={{
          ...theme.typography.title3,
          color: theme.colors.onSurface.variant,
          marginBottom: 6,
        }}
      >
        {summary.subtitle}
      </Text>

      {summary.exerciseCount > 0 && (
        <Text
          style={{
            ...theme.typography.footnote,
            color: withAlpha(theme.colors.onSurface.variant, 0.85),
          }}
        >
          {summary.exerciseCount} exercises · {summary.muscleGroup} focus
        </Text>
      )}
    </View>
  );
}
