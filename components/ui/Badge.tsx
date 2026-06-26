import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";

type BadgeProps = {
  text: string;
  color?: string;
  className?: string;
};

export function Badge({
  text,
  color = theme.colors.primary.container,
  className = "",
}: BadgeProps) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 ${className}`}
      style={{ backgroundColor: withAlpha(color, 0.12) }}
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
