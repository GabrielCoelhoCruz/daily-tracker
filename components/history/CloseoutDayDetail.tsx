import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { HistoricoDia } from "@/stores/useHistoryStore";
import {
  getDayLeakSummary,
  getExecutionScoreTone,
} from "@/utils/prepReviewUtils";

type CloseoutDayDetailProps = {
  historico: HistoricoDia;
};

function getScoreColor(score: number): string {
  const tone = getExecutionScoreTone(score);
  switch (tone) {
    case "complete":
    case "strong":
      return theme.colors.semantic.success;
    case "warning":
      return theme.colors.accent.DEFAULT;
    default:
      return theme.colors.semantic.error;
  }
}

export function CloseoutDayDetail({ historico }: CloseoutDayDetailProps) {
  const summary = getDayLeakSummary(historico);

  if (!summary.hasCloseout) {
    return (
      <View
        style={{
          borderRadius: theme.radius.lg,
          borderCurve: "continuous",
          backgroundColor: theme.colors.surface.container,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
          padding: 16,
          gap: 8,
        }}
      >
        <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
          Sem fechamento salvo
        </Text>
        <Text style={{ ...theme.typography.footnote }}>
          Este dia ainda só possui histórico básico de checklist.
        </Text>
      </View>
    );
  }

  const scoreColor =
    summary.executionScore != null
      ? getScoreColor(summary.executionScore)
      : theme.colors.onSurface.variant;

  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderCurve: "continuous",
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(scoreColor, 0.18),
        padding: 16,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="checkmark.seal.fill"
          mci="check-decagram"
          size={16}
          color={scoreColor}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: scoreColor,
          }}
        >
          Fechamento do dia
        </Text>
      </View>

      {summary.executionScore != null && (
        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 32,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            color: scoreColor,
          }}
        >
          {summary.executionScore}%
        </Text>
      )}

      {historico.closeoutEvidence ? (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Evidência
          </Text>
          <Text selectable style={{ ...theme.typography.footnote }}>
            {historico.closeoutEvidence}
          </Text>
        </View>
      ) : null}

      {historico.closeoutLeaks && historico.closeoutLeaks.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Vazamentos
          </Text>
          {historico.closeoutLeaks.map((leak) => (
            <View
              key={leak}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.semantic.error,
                }}
              />
              <Text style={{ ...theme.typography.body, fontSize: 14 }}>
                {leak}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {historico.dayNote ? (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Nota
          </Text>
          <Text selectable style={{ ...theme.typography.footnote }}>
            {historico.dayNote}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
