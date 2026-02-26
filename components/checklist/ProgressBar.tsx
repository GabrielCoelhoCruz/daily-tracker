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
    <View className={`gap-1 ${className}`}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-txt-primary">
          {completados}/{total}
        </Text>
        <Text className="text-sm font-medium text-accent">{percentage}%</Text>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-bg-elevated">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
