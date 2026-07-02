import { Text, View } from "react-native"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import type { DailyMetricSummary } from "@/utils/homeUtils"

type HomeMetricCardProps = {
  metric: DailyMetricSummary
}

export function HomeMetricCard({ metric }: HomeMetricCardProps) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 100,
        borderRadius: theme.radius.xl,
        borderCurve: "continuous",
        backgroundColor: withAlpha(theme.colors.surface.containerLow, 0.85),
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        padding: 16,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon
            sf={metric.sf as never}
            mci={metric.mci as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color={theme.colors.primary.DEFAULT}
          />
        </View>
        <Text style={{ ...theme.typography.overline }}>{metric.label}</Text>
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: -0.2,
        }}
        numberOfLines={1}
      >
        {metric.value}
      </Text>
      <Text
        style={{
          ...theme.typography.dataMono,
          fontSize: 11,
          color: theme.colors.onSurface.variant,
        }}
        numberOfLines={1}
      >
        {metric.detail}
      </Text>
    </View>
  )
}
