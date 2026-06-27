import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { MODE_LABELS, type PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import type { AISignal } from "@/utils/physiqueIntelligenceUtils";

type LatestAISignalCardProps = {
  signal: AISignal;
  latestCheckIn: PhysiqueCheckIn | null;
  onPress?: () => void;
};

export function LatestAISignalCard({
  signal,
  latestCheckIn,
  onPress,
}: LatestAISignalCardProps) {
  const accent = signal.hasAnalysis
    ? theme.colors.primary.DEFAULT
    : theme.colors.onSurface.variant;

  const footer =
    latestCheckIn && signal.hasAnalysis
      ? `Week ${latestCheckIn.week} · ${MODE_LABELS[latestCheckIn.mode] ?? latestCheckIn.mode}`
      : latestCheckIn
        ? "Analysis pending"
        : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Latest AI signal. ${signal.message}`}
      accessibilityState={{ disabled: !onPress }}
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 20,
        gap: 10,
        minHeight: 44,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="brain.head.profile"
          mci="brain"
          size={16}
          color={accent}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {signal.title}
        </Text>
      </View>

      <Text
        style={{
          ...theme.typography.body,
          color: signal.hasAnalysis
            ? theme.colors.onSurface.DEFAULT
            : theme.colors.onSurface.variant,
        }}
      >
        {signal.hasAnalysis
          ? signal.message
          : "Open the latest check-in to generate or view analysis."}
      </Text>

      {footer ? (
        <Text style={{ ...theme.typography.caption, fontSize: 11 }}>{footer}</Text>
      ) : null}
    </Pressable>
  );
}
