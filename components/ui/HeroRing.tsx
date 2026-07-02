import { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { theme, withAlpha } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type HeroRingProps = {
  percentage: number;
  /** Accent for the progress arc and % suffix. */
  accent?: string;
  size?: number;
  /** Small mono label above the number. */
  label?: string;
  /** Mono caption under the number (e.g. "12 de 59"). */
  caption?: string;
};

/**
 * Large instrument-style progress ring: gradient arc animated to value,
 * oversized numeral in the center. The visual anchor of a screen.
 */
export function HeroRing({
  percentage,
  accent = theme.colors.primary.DEFAULT,
  size = 216,
  label,
  caption,
}: HeroRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      250,
      withTiming(clamped / 100, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [clamped, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      }}
    >
      {/* Faint orbit rings */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: size + 26,
          height: size + 26,
          borderRadius: (size + 26) / 2,
          borderWidth: 1,
          borderColor: withAlpha(accent, 0.12),
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: size + 52,
          height: size + 52,
          borderRadius: (size + 52) / 2,
          borderWidth: 1,
          borderColor: withAlpha(accent, 0.05),
        }}
      />

      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={withAlpha(accent, 0.55)} />
            <Stop offset="100%" stopColor={accent} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={withAlpha(theme.colors.onSurface.DEFAULT, 0.07)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={{ alignItems: "center", gap: 2 }}>
        {label ? (
          <Text style={{ ...theme.typography.overline, marginBottom: 4 }}>
            {label}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: 64,
              fontWeight: "900",
              letterSpacing: -3.5,
              color: theme.colors.onSurface.DEFAULT,
              fontVariant: ["tabular-nums"],
            }}
          >
            {clamped}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 22,
              color: accent,
              marginLeft: 4,
            }}
          >
            %
          </Text>
        </View>
        {caption ? (
          <Text
            style={{
              ...theme.typography.dataMono,
              fontSize: 11,
              color: theme.colors.onSurface.variant,
            }}
          >
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
