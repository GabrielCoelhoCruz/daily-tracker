import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { PrepReviewSummary } from "@/utils/prepReviewUtils";

type HistoryMetricsGridProps = {
  summary: PrepReviewSummary;
};

type MetricItem = {
  label: string;
  value: string;
  color: string;
  sf: "flame.fill" | "calendar" | "calendar.badge.clock" | "checkmark.seal.fill";
  mci: "fire" | "calendar-week" | "calendar-month" | "check-decagram";
};

function buildMetrics(summary: PrepReviewSummary): MetricItem[] {
  const weeklyColor =
    summary.weeklyAdherence !== null && summary.weeklyAdherence >= 80
      ? theme.colors.semantic.success
      : summary.weeklyAdherence !== null && summary.weeklyAdherence >= 60
        ? theme.colors.primary.DEFAULT
        : theme.colors.onSurface.variant;

  const monthlyColor =
    summary.monthlyAdherence !== null && summary.monthlyAdherence >= 80
      ? theme.colors.semantic.success
      : summary.monthlyAdherence !== null && summary.monthlyAdherence >= 60
        ? theme.colors.primary.DEFAULT
        : theme.colors.onSurface.variant;

  return [
    {
      label: "Streak",
      value: `${summary.streak}`,
      color:
        summary.streak > 0
          ? theme.colors.semantic.success
          : theme.colors.onSurface.variant,
      sf: "flame.fill",
      mci: "fire",
    },
    {
      label: "Semanal",
      value:
        summary.weeklyAdherence !== null
          ? `${summary.weeklyAdherence}%`
          : "—",
      color: weeklyColor,
      sf: "calendar.badge.clock",
      mci: "calendar-week",
    },
    {
      label: "Mensal",
      value:
        summary.monthlyAdherence !== null
          ? `${summary.monthlyAdherence}%`
          : "—",
      color: monthlyColor,
      sf: "calendar",
      mci: "calendar-month",
    },
    {
      label: "Perfeitos",
      value: `${summary.perfectDaysThisWeek}`,
      color:
        summary.perfectDaysThisWeek > 0
          ? theme.colors.semantic.success
          : theme.colors.onSurface.variant,
      sf: "checkmark.seal.fill",
      mci: "check-decagram",
    },
  ];
}

function MetricCell({ metric }: { metric: MetricItem }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        gap: 4,
        paddingVertical: 12,
      }}
    >
      <AppIcon sf={metric.sf} mci={metric.mci} size={18} color={metric.color} />
      <Text
        style={{
          ...theme.typography.title3,
          fontSize: 22,
          fontVariant: ["tabular-nums"],
          color: metric.color,
        }}
      >
        {metric.value}
      </Text>
      <Text style={{ ...theme.typography.caption }}>{metric.label}</Text>
    </View>
  );
}

export function HistoryMetricsGrid({ summary }: HistoryMetricsGridProps) {
  const metrics = buildMetrics(summary);
  const topRow = metrics.slice(0, 2);
  const bottomRow = metrics.slice(2, 4);

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        }}
      >
        {topRow.map((metric) => (
          <MetricCell key={metric.label} metric={metric} />
        ))}
      </View>
      <View style={{ flexDirection: "row" }}>
        {bottomRow.map((metric) => (
          <MetricCell key={metric.label} metric={metric} />
        ))}
      </View>
    </View>
  );
}
