import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { EvidenceSnapshot } from "@/utils/physiqueIntelligenceUtils";

type EvidenceSnapshotCardProps = {
  snapshot: EvidenceSnapshot;
  onActionPress?: () => void;
};

function getFreshnessColor(status: EvidenceSnapshot["freshnessStatus"]): string {
  switch (status) {
    case "fresh":
      return theme.colors.semantic.success;
    case "due-soon":
      return theme.colors.accent.DEFAULT;
    case "overdue":
      return theme.colors.semantic.error;
    default:
      return theme.colors.onSurface.variant;
  }
}

export function EvidenceSnapshotCard({
  snapshot,
  onActionPress,
}: EvidenceSnapshotCardProps) {
  const accent = getFreshnessColor(snapshot.freshnessStatus);

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.18),
        padding: 18,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="doc.text.magnifyingglass"
          mci="file-search-outline"
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
          Evidência
        </Text>
      </View>

      {snapshot.hasEvidence ? (
        <>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              Último check-in
            </Text>
            <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
              {snapshot.evidenceLabel}
            </Text>
          </View>

          <View style={{ gap: 4 }}>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              Validade
            </Text>
            <Text style={{ ...theme.typography.footnote }}>
              {snapshot.freshnessLabel}
            </Text>
          </View>

          <View style={{ gap: 4 }}>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              Status
            </Text>
            <Text style={{ ...theme.typography.footnote }}>
              {snapshot.hasAnalysis
                ? "Análise IA disponível"
                : snapshot.hasScores
                  ? "Scores disponíveis · análise pendente"
                  : "Check-in registrado · análise pendente"}
            </Text>
          </View>
        </>
      ) : (
        <Text style={{ ...theme.typography.footnote }}>
          {snapshot.evidenceLabel}
        </Text>
      )}

      {onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={snapshot.nextActionLabel}
          style={{
            minHeight: 44,
            borderRadius: theme.radius.lg,
            backgroundColor: withAlpha(accent, 0.12),
            borderWidth: 1,
            borderColor: withAlpha(accent, 0.22),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...theme.typography.callout,
              fontWeight: "700",
              color: accent,
            }}
          >
            {snapshot.nextActionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
