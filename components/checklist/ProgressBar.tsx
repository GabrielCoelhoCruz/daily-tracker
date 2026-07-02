import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { animateNext } from "@/utils/animationUtils";

type ProgressBarProps = {
  completados: number;
  total: number;
  className?: string;
};

export function ProgressBar({
  completados,
  total,
  className = "",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completados / total) * 100) : 0;
  const prevPercentage = useRef(percentage);

  useEffect(() => {
    if (prevPercentage.current !== percentage) {
      animateNext();
      prevPercentage.current = percentage;
    }
  }, [percentage]);

  const barColor =
    percentage === 100
      ? theme.colors.semantic.success
      : theme.colors.accent.DEFAULT;

  return (
    <View className={`gap-1.5 ${className}`}>
      <View className="flex-row items-center justify-between">
        <Text
          selectable
          style={{
            ...theme.typography.dataMono,
            fontSize: 13,
          }}
        >
          {completados}/{total}
        </Text>
        <Text
          selectable
          style={{
            ...theme.typography.dataMono,
            fontSize: 13,
            color: barColor,
          }}
        >
          {percentage}%
        </Text>
      </View>
      <View
        className="overflow-hidden rounded-full bg-bg-elevated"
        style={{ height: 8 }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}
