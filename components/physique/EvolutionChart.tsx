import { View, Text, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useMemo } from "react";
import { theme } from "@/constants/theme";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";
import { STAGE_READINESS_ORDER, STAGE_READINESS_LABELS } from "@/services/physiqueAnalysis";
import type { StageReadinessLevel } from "@/services/physiqueAnalysis";

function stageReadinessToNumber(level: string): number {
  const idx = STAGE_READINESS_ORDER.indexOf(level as StageReadinessLevel);
  return idx >= 0 ? idx + 1 : 0;
}

export function EvolutionChart() {
  const { width: screenWidth } = useWindowDimensions();
  const checkIns = usePhysiqueStore((s) => s.checkIns);

  const data = useMemo(() => {
    return checkIns
      .filter((c) => c.scores?.stageReadiness != null)
      .sort((a, b) => a.week - b.week)
      .map((c) => ({
        value: stageReadinessToNumber(c.scores!.stageReadiness!),
        label: `S${c.week}`,
      }));
  }, [checkIns]);

  if (data.length < 2) return null;

  const yLabels = STAGE_READINESS_ORDER.map((_, i) =>
    i === 0 ? "Longe" : i === 4 ? "Ready" : ""
  );

  return (
    <View accessibilityLabel="Gráfico de evolução stage readiness">
      <Text style={[theme.typography.footnote, { marginBottom: 8 }]}>
        Stage Readiness
      </Text>
      <LineChart
        data={data}
        height={160}
        width={screenWidth - 80}
        color="#f59e0b"
        thickness={2}
        dataPointsColor="#f59e0b"
        dataPointsRadius={4}
        maxValue={5}
        noOfSections={5}
        stepValue={1}
        rulesColor="rgba(120,113,108,0.2)"
        backgroundColor="transparent"
        xAxisLabelTextStyle={{ color: "#78716c", fontSize: 10 }}
        yAxisTextStyle={{ color: "#78716c", fontSize: 9 }}
        xAxisColor="transparent"
        yAxisColor="transparent"
        formatYLabel={(val: string) => {
          const idx = Math.round(Number(val));
          if (idx === 1) return "Longe";
          if (idx === 2) return "Prog.";
          if (idx === 3) return "Aprox.";
          if (idx === 4) return "Quase";
          if (idx === 5) return "Ready";
          return "";
        }}
      />
    </View>
  );
}
