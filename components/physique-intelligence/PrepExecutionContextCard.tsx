import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { PhysiquePrepContext } from "@/utils/physiqueIntelligenceUtils";

type PrepExecutionContextCardProps = {
  context: PhysiquePrepContext;
};

export function PrepExecutionContextCard({
  context,
}: PrepExecutionContextCardProps) {
  const accent = context.hasCloseouts
    ? theme.colors.primary.DEFAULT
    : theme.colors.onSurface.variant;

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 18,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="chart.bar.doc.horizontal"
          mci="chart-timeline-variant"
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
          Contexto de Prep
        </Text>
      </View>

      {context.hasCloseouts ? (
        <>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              Últimos 7 dias
            </Text>
            <Text style={{ ...theme.typography.footnote }}>{context.evidence}</Text>
          </View>

          {context.mainLeakTitle ? (
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.onSurface.variant,
                }}
              >
                Principal vazamento
              </Text>
              <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
                {context.mainLeakTitle}
              </Text>
            </View>
          ) : null}

          <Text style={{ ...theme.typography.caption, color: theme.colors.onSurface.variant }}>
            Contexto objetivo de execução — sem inferir causalidade visual.
          </Text>
        </>
      ) : (
        <Text style={{ ...theme.typography.footnote }}>{context.evidence}</Text>
      )}
    </View>
  );
}
