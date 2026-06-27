import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { TrainingSessionSummary } from "@/utils/trainingSessionUtils";

type WorkoutRecoveryStateProps = {
  summary: TrainingSessionSummary;
  dayName: string;
  isWeekend: boolean;
};

export function WorkoutRecoveryState({
  summary,
  dayName,
  isWeekend,
}: WorkoutRecoveryStateProps) {
  const isDayOff = summary.mode === "day-off";
  const iconSf = isDayOff ? ("pause.circle.fill" as const) : ("moon.fill" as const);
  const iconMci = isDayOff ? ("pause-circle" as const) : ("moon-waning-crescent" as const);

  const bodyText = isDayOff
    ? "Choose another day to view the protocol."
    : isWeekend
      ? "Use this day to recover and stay on protocol."
      : "Use this day to recover and stay on protocol.";

  const subtitle =
    summary.mode === "rest" && !isWeekend
      ? "No workout scheduled today."
      : summary.subtitle;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        paddingTop: 48,
        paddingBottom: 32,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: theme.colors.surface.container,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          marginBottom: 20,
        }}
      >
        <AppIcon
          sf={iconSf}
          mci={iconMci}
          size={36}
          color={theme.colors.onSurface.variant}
        />
      </View>

      <Text style={theme.typography.labelSmall}>{dayName}</Text>
      <Text
        style={{
          ...theme.typography.headlineLarge,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {summary.title}
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          color: theme.colors.onSurface.variant,
          textAlign: "center",
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        {subtitle}
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          color: withAlpha(theme.colors.onSurface.variant, 0.75),
          textAlign: "center",
          marginTop: 6,
          lineHeight: 20,
        }}
      >
        {bodyText}
      </Text>
    </View>
  );
}
