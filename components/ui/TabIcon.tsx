import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme, withAlpha } from "@/constants/theme";

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size?: number;
};

export const TAB_INACTIVE_TINT = withAlpha(theme.colors.onSurface.variant, 0.4);

export function TabIcon({ name, focused, color, size = 22 }: TabIconProps) {
  return (
    <View style={{ alignItems: "center" }}>
      {focused && (
        <View
          style={{
            position: "absolute",
            top: -12,
            width: 40,
            height: 3,
            borderRadius: 2,
            backgroundColor: theme.colors.primary.DEFAULT,
          }}
        />
      )}
      <Ionicons
        name={(focused ? name : `${name}-outline`) as keyof typeof Ionicons.glyphMap}
        size={size}
        color={color}
      />
    </View>
  );
}

export const tabBarLabelStyle = {
  fontSize: 10,
  fontWeight: "800",
  letterSpacing: 1.5,
  textTransform: "uppercase",
} as const;
