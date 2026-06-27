import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type {
  PhysiqueIntelligenceSummary,
  StageReadinessTrend,
} from "@/utils/physiqueIntelligenceUtils";
import { getStageReadinessTrendLabel } from "@/utils/physiqueIntelligenceUtils";

type PhysiqueMetricsGridProps = {
  summary: PhysiqueIntelligenceSummary;
  readinessTrend: StageReadinessTrend;
};

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  sf: string;
  mci: keyof typeof MaterialCommunityIcons.glyphMap;
  valueColor?: string;
};

function MetricCard({
  label,
  value,
  detail,
  sf,
  mci,
  valueColor = theme.colors.onSurface.DEFAULT,
}: MetricCardProps) {
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
          sf={sf as never}
          mci={mci}
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
          {label}
        </Text>
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontSize: 15,
          color: valueColor,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      {detail ? (
        <Text
          style={{ ...theme.typography.caption, fontSize: 11 }}
          numberOfLines={1}
        >
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

function getTrendColor(direction: StageReadinessTrend["direction"]) {
  switch (direction) {
    case "improving":
      return theme.colors.semantic.success;
    case "declining":
      return theme.colors.semantic.error;
    default:
      return theme.colors.onSurface.DEFAULT;
  }
}

export function PhysiqueMetricsGrid({
  summary,
  readinessTrend,
}: PhysiqueMetricsGridProps) {
  const weightValue =
    summary.latestWeightKg != null ? `${summary.latestWeightKg}kg` : "—";
  const weightDetail =
    summary.weightDeltaKg != null
      ? `${summary.weightDeltaKg >= 0 ? "+" : ""}${summary.weightDeltaKg}kg`
      : undefined;

  const metrics: MetricCardProps[] = [
    {
      label: "Weight",
      value: weightValue,
      detail: weightDetail,
      sf: "scalemass.fill",
      mci: "scale-bathroom",
    },
    {
      label: "Readiness",
      value: getStageReadinessTrendLabel(readinessTrend),
      sf: "chart.line.uptrend.xyaxis",
      mci: "chart-line",
      valueColor: getTrendColor(readinessTrend.direction),
    },
    {
      label: "Check-ins",
      value: String(summary.checkInCount),
      sf: "camera.viewfinder",
      mci: "camera-outline",
    },
    {
      label: "Category",
      value: summary.targetCategoryLabel ?? "—",
      sf: "magnifyingglass",
      mci: "magnify",
    },
  ];

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <MetricCard {...metrics[0]} />
        <MetricCard {...metrics[1]} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <MetricCard {...metrics[2]} />
        <MetricCard {...metrics[3]} />
      </View>
    </View>
  );
}
