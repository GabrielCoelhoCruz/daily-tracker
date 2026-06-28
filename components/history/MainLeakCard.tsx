import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { WeeklyExecutionReview } from "@/utils/prepReviewUtils";

type MainLeakCardProps = {
  mainLeak: WeeklyExecutionReview["mainLeak"];
  closedDays: number;
};

export function MainLeakCard({ mainLeak, closedDays }: MainLeakCardProps) {
  if (closedDays === 0) {
    return (
      <View
        style={{
          borderRadius: theme.radius.xl,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
          padding: 16,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf="chart.line.uptrend.xyaxis"
            mci="chart-line"
            size={16}
            color={theme.colors.onSurface.variant}
          />
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: "700",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: theme.colors.onSurface.variant,
            }}
          >
            Padrão
          </Text>
        </View>
        <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
          Feche mais dias para mapear vazamentos
        </Text>
        <Text style={{ ...theme.typography.footnote }}>
          Use o fechamento diário na aba Hoje para registrar score, evidência e
          vazamentos.
        </Text>
      </View>
    );
  }

  if (!mainLeak) {
    return (
      <View
        style={{
          borderRadius: theme.radius.xl,
          backgroundColor: withAlpha(theme.colors.semantic.success, 0.1),
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.semantic.success, 0.2),
          padding: 16,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppIcon
            sf="checkmark.seal.fill"
            mci="check-decagram"
            size={16}
            color={theme.colors.semantic.success}
          />
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: "700",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: theme.colors.semantic.success,
            }}
          >
            Execução
          </Text>
        </View>
        <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
          Nenhum vazamento repetido nesta semana
        </Text>
        <Text style={{ ...theme.typography.footnote }}>
          {closedDays} {closedDays === 1 ? "fechamento" : "fechamentos"}{" "}
          registrados sem padrão dominante.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: withAlpha(theme.colors.semantic.warning, 0.1),
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.semantic.warning, 0.2),
        padding: 16,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="exclamationmark.triangle.fill"
          mci="alert"
          size={16}
          color={theme.colors.semantic.warning}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: theme.colors.semantic.warning,
          }}
        >
          Principal vazamento
        </Text>
      </View>
      <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
        {mainLeak.title}
      </Text>
      <Text style={{ ...theme.typography.footnote }}>{mainLeak.evidence}</Text>
    </View>
  );
}
