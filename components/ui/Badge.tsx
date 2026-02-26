import { Text, View } from "react-native";

type BadgeProps = {
  text: string;
  color?: string;
  className?: string;
};

export function Badge({ text, color = "#f59e0b", className = "" }: BadgeProps) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 ${className}`}
      style={{ backgroundColor: color + "20" }}
    >
      <Text
        style={{ color, fontVariant: ["tabular-nums"] }}
        className="text-xs font-semibold"
      >
        {text}
      </Text>
    </View>
  );
}
