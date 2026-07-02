import { Platform, View, type ViewProps } from "react-native";
import { theme, withAlpha } from "@/constants/theme";

type CardProps = ViewProps;

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

export function Card({ className = "", style, children, ...props }: CardProps) {
  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: theme.colors.surface.container,
          padding: 16,
          borderRadius: 16,
          borderCurve: "continuous",
          // Hairline top-light edge — reads as machined metal under the dark UI
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.055),
        },
        cardShadow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
