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

  return (
    <View className={`gap-1.5 ${className}`}>
      <View className="flex-row items-center justify-between">
        <Text
          selectable
          className="text-sm font-medium text-txt-primary"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {completados}/{total}
        </Text>
        <Text
          selectable
          className="text-sm font-semibold"
          style={{
            fontVariant: ["tabular-nums"],
            color: percentage === 100 ? theme.colors.semantic.success : theme.colors.accent.DEFAULT,
          }}
        >
          {percentage}%
        </Text>
      </View>
      <View className="overflow-hidden rounded-full bg-bg-elevated" style={{ height: 12 }}>
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
