import { View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { theme } from "@/constants/theme";

type HeroGlowProps = {
  /** Glow tint — defaults to the app's amber primary. */
  color?: string;
  /** Peak opacity at the glow center. */
  intensity?: number;
  /** Total height of the glow field. */
  height?: number;
};

/**
 * Atmospheric radial glow rendered behind hero elements.
 * Absolute-positioned; parent must be position: relative (RN default).
 */
export function HeroGlow({
  color = theme.colors.primary.DEFAULT,
  intensity = 0.16,
  height = 340,
}: HeroGlowProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -40,
        left: -60,
        right: -60,
        height,
      }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="heroGlow" cx="50%" cy="42%" rx="55%" ry="48%">
            <Stop offset="0%" stopColor={color} stopOpacity={intensity} />
            <Stop offset="55%" stopColor={color} stopOpacity={intensity * 0.4} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGlow)" />
      </Svg>
    </View>
  );
}
