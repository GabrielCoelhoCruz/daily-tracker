import { Platform, View, type ViewProps } from "react-native";
import { theme } from "@/constants/theme";

type CardProps = ViewProps;

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
