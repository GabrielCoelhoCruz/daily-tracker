import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { Exercicio } from "@/data/treinos";

type UpcomingExercisesCardProps = {
  upcomingExercises: Exercicio[];
  isFinalLift: boolean;
};

export function UpcomingExercisesCard({
  upcomingExercises,
  isFinalLift,
}: UpcomingExercisesCardProps) {
  if (isFinalLift) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface.container,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          padding: 16,
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <AppIcon
            sf="checkmark.circle.fill"
            mci="check-circle"
            size={18}
            color={theme.colors.primary.DEFAULT}
          />
          <Text
            style={{
              ...theme.typography.labelMedium,
              color: theme.colors.primary.DEFAULT,
            }}
          >
            Final lift
          </Text>
        </View>
        <Text
          style={{
            ...theme.typography.body,
            fontWeight: "600",
          }}
        >
          Finish strong
        </Text>
      </View>
    );
  }

  if (upcomingExercises.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        padding: 16,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <AppIcon
          sf="arrow.forward.circle.fill"
          mci="arrow-right-circle"
          size={18}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: withAlpha(theme.colors.onSurface.variant, 0.85),
          }}
        >
          Up Next
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {upcomingExercises.map((exercicio) => (
          <Text
            key={exercicio.id}
            style={{
              ...theme.typography.body,
              color: theme.colors.onSurface.DEFAULT,
            }}
            numberOfLines={2}
          >
            {exercicio.nome}
          </Text>
        ))}
      </View>
    </View>
  );
}
