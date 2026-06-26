import { Platform, PlatformColor } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolView, SymbolViewProps } from "expo-symbols";
import { theme } from "@/constants/theme";

type AppIconProps = {
  /** SF Symbol name (iOS). */
  sf: SymbolViewProps["name"];
  /** MaterialCommunityIcons glyph (Android / web). */
  mci: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: number;
  color?: string;
  /** SF Symbol weight — iOS only. */
  weight?: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
};

/**
 * Platform-adaptive icon: SF Symbol on iOS, MaterialCommunityIcons elsewhere.
 * Keeps in-app icons aligned with NativeTabs SF Symbol tab bar on iOS.
 */
export function AppIcon({
  sf,
  mci,
  size = 22,
  color = theme.colors.onSurface.DEFAULT,
  weight = "regular",
}: AppIconProps) {
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={sf}
        size={size}
        tintColor={color ?? PlatformColor("label")}
        weight={weight}
        resizeMode="scaleAspectFit"
      />
    );
  }

  return <MaterialCommunityIcons name={mci} size={size} color={color} />;
}
