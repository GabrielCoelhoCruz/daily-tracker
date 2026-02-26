import { Text, View } from "react-native";

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
            color: percentage === 100 ? "#22c55e" : "#f59e0b",
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
