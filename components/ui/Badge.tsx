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
      className={`rounded-md px-2 py-0.5 ${className}`}
      style={{
        backgroundColor: withAlpha(color, 0.1),
        borderWidth: 1,
        borderColor: withAlpha(color, 0.22),
        borderCurve: "continuous",
      }}
    >
      <Text
        style={{
          color,
          fontFamily: theme.fonts.mono,
          fontSize: 11,
          letterSpacing: 0.3,
          fontVariant: ["tabular-nums"],
        }}
      >
        {text}
      </Text>
    </View>
  );
}
