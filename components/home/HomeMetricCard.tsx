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
        minHeight: 96,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 16,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf={metric.sf as never}
          mci={metric.mci as keyof typeof MaterialCommunityIcons.glyphMap}
          size={16}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {metric.label}
        </Text>
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontSize: 15,
        }}
        numberOfLines={1}
      >
        {metric.value}
      </Text>
      <Text
        style={{
          ...theme.typography.caption,
          fontSize: 11,
        }}
        numberOfLines={1}
      >
        {metric.detail}
      </Text>
    </View>
  )
}
