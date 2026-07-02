import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme, withAlpha } from "@/constants/theme";

type CircularProgressProps = {
  percentage: number;
  size?: number;
};

export function CircularProgress({
  percentage,
  size = 220,
}: CircularProgressProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer glow rings */}
      <View
        style={{
          position: "absolute",
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.12),
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size + 34,
          height: size + 34,
          borderRadius: (size + 34) / 2,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.05),
        }}
      />

      {/* SVG rings */}
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surface.containerHighest}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primary.DEFAULT}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center label */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: theme.colors.onSurface.variant,
            marginBottom: 6,
          }}
        >
          OBJETIVO DIÁRIO
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: 56,
              fontWeight: "900",
              color: theme.colors.onSurface.DEFAULT,
              letterSpacing: -3,
              fontVariant: ["tabular-nums"],
            }}
          >
            {clamped}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 20,
              color: theme.colors.primary.DEFAULT,
              marginLeft: 4,
            }}
          >
            %
          </Text>
        </View>
      </View>
    </View>
  );
}
