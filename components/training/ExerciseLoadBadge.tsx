import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import {
  formatLoadKg,
  type ExerciseLoadInfo,
} from "@/utils/trainingSessionUtils";

type ExerciseLoadBadgeProps = {
  loadInfo: ExerciseLoadInfo;
};

export function ExerciseLoadBadge({ loadInfo }: ExerciseLoadBadgeProps) {
  const { todayLoadKg, previousLoadKg } = loadInfo;

  if (todayLoadKg != null) {
    return (
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: withAlpha(theme.colors.primary.container, 0.15),
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.primary.container, 0.3),
        }}
      >
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.primary.DEFAULT,
            fontWeight: "700",
          }}
        >
          {formatLoadKg(todayLoadKg)}
        </Text>
      </View>
    );
  }

  if (previousLoadKg != null) {
    return (
      <Text
        style={{
          ...theme.typography.caption,
          color: withAlpha(theme.colors.onSurface.variant, 0.85),
        }}
      >
        Última: {formatLoadKg(previousLoadKg)}
      </Text>
    );
  }

  return null;
}
