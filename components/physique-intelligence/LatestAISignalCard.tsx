import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { EvidenceAISignal } from "@/utils/physiqueIntelligenceUtils";

type LatestAISignalCardProps = {
  signal: EvidenceAISignal;
};

export function LatestAISignalCard({ signal }: LatestAISignalCardProps) {
  const accent = signal.hasAnalysis
    ? theme.colors.primary.DEFAULT
    : theme.colors.onSurface.variant;

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: withAlpha(accent, signal.hasAnalysis ? 0.08 : 0.04),
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.18),
        padding: 18,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon sf="brain.head.profile" mci="brain" size={16} color={accent} />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          Sinal de IA
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.onSurface.variant,
          }}
        >
          Sinal
        </Text>
        <Text
          style={{
            ...theme.typography.body,
            color: signal.hasAnalysis
              ? theme.colors.onSurface.DEFAULT
              : theme.colors.onSurface.variant,
          }}
        >
          {signal.message}
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.onSurface.variant,
          }}
        >
          Evidência
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{signal.evidence}</Text>
      </View>

      {signal.limitation ? (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Limitação
          </Text>
          <Text style={{ ...theme.typography.footnote }}>{signal.limitation}</Text>
        </View>
      ) : null}
    </View>
  );
}
