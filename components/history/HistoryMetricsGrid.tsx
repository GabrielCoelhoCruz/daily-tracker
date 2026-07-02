import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { WeeklyExecutionReview } from "@/utils/prepReviewUtils";
import { formatPtBR } from "@/utils/dateUtils";

type HistoryMetricsGridProps = {
  review: WeeklyExecutionReview;
};

type MetricItem = {
  label: string;
  value: string;
  color: string;
  sf:
    | "chart.bar.fill"
    | "exclamationmark.triangle.fill"
    | "star.fill"
    | "checkmark.seal.fill";
  mci: "chart-bar" | "alert" | "star" | "check-decagram";
};

function buildMetrics(review: WeeklyExecutionReview): MetricItem[] {
  const averageColor =
    review.averageScore != null && review.averageScore >= 75
      ? theme.colors.semantic.success
      : review.averageScore != null && review.averageScore >= 50
        ? theme.colors.accent.DEFAULT
        : review.averageScore != null
          ? theme.colors.semantic.error
          : theme.colors.onSurface.variant;

  const bestDayShort = review.bestDay
    ? formatPtBR(review.bestDay.date).split(" ")[0] ?? "—"
    : null;

  return [
    {
      label: "Execução média",
      value:
        review.averageScore != null ? `${review.averageScore}%` : "—",
      color: averageColor,
      sf: "chart.bar.fill",
      mci: "chart-bar",
    },
    {
      label: "Com vazamento",
      value: `${review.daysWithLeaks}`,
      color:
        review.daysWithLeaks > 0
          ? theme.colors.semantic.warning
          : theme.colors.semantic.success,
      sf: "exclamationmark.triangle.fill",
      mci: "alert",
    },
    {
      label: bestDayShort ? `Melhor · ${bestDayShort}` : "Melhor dia",
      value: review.bestDay ? `${review.bestDay.score}%` : "—",
      color:
        review.bestDay != null
          ? theme.colors.semantic.success
          : theme.colors.onSurface.variant,
      sf: "star.fill",
      mci: "star",
    },
    {
      label: "Fechamentos",
      value: `${review.closedDays}/${review.totalDays}`,
      color:
        review.closedDays >= 5
          ? theme.colors.semantic.success
          : review.closedDays >= 3
            ? theme.colors.primary.DEFAULT
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
        paddingHorizontal: 4,
      }}
    >
      <AppIcon sf={metric.sf} mci={metric.mci} size={18} color={metric.color} />
      <Text
        style={{
          ...theme.typography.title3,
          fontSize: 22,
          fontWeight: "800",
          letterSpacing: -0.5,
          fontVariant: ["tabular-nums"],
          color: metric.color,
        }}
      >
        {metric.value}
      </Text>
      <Text
        style={{
          ...theme.typography.labelMono,
          fontSize: 9,
          letterSpacing: 0.8,
          textAlign: "center",
        }}
      >
        {metric.label}
      </Text>
    </View>
  );
}

export function HistoryMetricsGrid({ review }: HistoryMetricsGridProps) {
  const metrics = buildMetrics(review);
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
