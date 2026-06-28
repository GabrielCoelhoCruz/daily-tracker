import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

export function HistoryEmptyState() {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 12,
        paddingVertical: 48,
        paddingHorizontal: 24,
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppIcon
          sf="chart.bar.doc.horizontal"
          mci="chart-timeline-variant"
          size={32}
          color={theme.colors.onSurface.variant}
        />
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        Nenhum fechamento ainda
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          textAlign: "center",
          lineHeight: 20,
          color: theme.colors.onSurface.variant,
        }}
      >
        Feche seu primeiro dia na aba Hoje para mapear{"\n"}score, evidência e
        vazamentos de prep.
      </Text>
    </View>
  );
}
