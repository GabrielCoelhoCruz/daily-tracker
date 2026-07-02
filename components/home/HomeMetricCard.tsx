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
        minHeight: 104,
        borderRadius: theme.radius.xl,
        borderCurve: "continuous",
        backgroundColor: withAlpha(theme.colors.surface.containerLow, 0.85),
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.12),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon
            sf={metric.sf as never}
            mci={metric.mci as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color={theme.colors.primary.DEFAULT}
          />
        </View>
        <Text style={{ ...theme.typography.overline }}>{metric.label}</Text>
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          letterSpacing: -0.3,
          color: theme.colors.onSurface.DEFAULT,
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
