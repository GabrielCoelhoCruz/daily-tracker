import { View } from "react-native"
import { HomeMetricCard } from "@/components/home/HomeMetricCard"
import type { DailyMetricSummary } from "@/utils/homeUtils"

type DailyMetricsGridProps = {
  metrics: DailyMetricSummary[]
}

export function DailyMetricsGrid({ metrics }: DailyMetricsGridProps) {
  const topRow = metrics.slice(0, 2)
  const bottomRow = metrics.slice(2, 4)

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {topRow.map((metric) => (
          <HomeMetricCard key={metric.kind} metric={metric} />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {bottomRow.map((metric) => (
          <HomeMetricCard key={metric.kind} metric={metric} />
        ))}
      </View>
    </View>
  )
}
