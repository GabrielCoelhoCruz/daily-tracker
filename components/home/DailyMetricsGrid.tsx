import { View } from "react-native"
import { HomeMetricCard } from "@/components/home/HomeMetricCard"
import type { DailyMetricSummary } from "@/utils/homeUtils"

type DailyMetricsGridProps = {
  metrics: DailyMetricSummary[]
}

export function DailyMetricsGrid({ metrics }: DailyMetricsGridProps) {
  if (metrics.length === 0) return null

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {metrics.map((metric) => (
        <HomeMetricCard key={metric.kind} metric={metric} />
      ))}
    </View>
  )
}
