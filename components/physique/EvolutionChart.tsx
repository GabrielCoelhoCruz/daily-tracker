import { View, Text, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useMemo } from "react";
import { theme } from "@/constants/theme";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";

export function EvolutionChart() {
  const { width: screenWidth } = useWindowDimensions();
  const checkIns = usePhysiqueStore((s) => s.checkIns);

  const data = useMemo(() => {
    return checkIns
      .filter((c) => c.scores?.stageReadiness != null)
      .sort((a, b) => a.week - b.week)
      .map((c) => ({
        value: c.scores!.stageReadiness!,
        label: `S${c.week}`,
      }));
  }, [checkIns]);

  if (data.length < 2) return null;

  return (
    <View accessibilityLabel="Gráfico de evolução stage readiness">
      <Text style={[theme.typography.footnote, { marginBottom: 8 }]}>
        Stage Readiness
      </Text>
      <LineChart
        data={data}
        height={180}
        width={screenWidth - 80}
        color="#f59e0b"
        thickness={2}
        dataPointsColor="#f59e0b"
        dataPointsRadius={4}
        maxValue={100}
        noOfSections={5}
        rulesColor="rgba(120,113,108,0.2)"
        backgroundColor="transparent"
        xAxisLabelTextStyle={{ color: "#78716c", fontSize: 10 }}
        yAxisTextStyle={{ color: "#78716c", fontSize: 10 }}
        xAxisColor="transparent"
        yAxisColor="transparent"
      />
    </View>
  );
}
