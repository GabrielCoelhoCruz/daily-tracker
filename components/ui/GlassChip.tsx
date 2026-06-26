import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  Text as RNText,
  View,
  ViewStyle,
} from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { theme } from "@/constants/theme";

type GlassChipProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

// expo-glass-effect is included in Expo Go and falls back to a plain View on
// iOS < 26 / Android / web, so this is safe to render anywhere. We additionally
// gate on the runtime API availability (some iOS 26 betas crash without it)
// and on Reduce Transparency for legibility.
function useShouldRenderGlass() {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency
    );
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    return () => sub.remove();
  }, []);

  if (Platform.OS !== "ios") return false;
  if (reduceTransparency) return false;
  return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}

function GlassSurfaceChip({ label, style }: Omit<GlassChipProps, "onPress">) {
  return (
    <GlassView
      glassEffectStyle="regular"
      style={[
        {
          borderRadius: theme.radius.lg,
          paddingHorizontal: 14,
          paddingVertical: 8,
          justifyContent: "center",
        },
        style,
      ]}
    >
      <RNText
        style={{ color: theme.colors.onSurface.DEFAULT, fontSize: 13, fontWeight: "600" }}
      >
        {label}
      </RNText>
    </GlassView>
  );
}

function FallbackChip({ label, style }: Omit<GlassChipProps, "onPress">) {
  return (
    <View
      style={[
        {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.outline.variant,
          backgroundColor: theme.colors.surface.containerHigh,
          paddingHorizontal: 14,
          paddingVertical: 8,
        },
        style,
      ]}
    >
      <RNText
        style={{ color: theme.colors.onSurface.DEFAULT, fontSize: 13, fontWeight: "600" }}
      >
        {label}
      </RNText>
    </View>
  );
}

/**
 * Adaptive glass chip: renders a native iOS Liquid Glass surface on iOS 26+
 * (via expo-glass-effect, included in Expo Go) and a solid translucent
 * fallback elsewhere. Use only for floating controls/navigation chrome —
 * never for primary content.
 */
export function GlassChip({ label, onPress, style }: GlassChipProps) {
  const shouldRenderGlass = useShouldRenderGlass();
  const chip = shouldRenderGlass ? (
    <GlassSurfaceChip label={label} style={style} />
  ) : (
    <FallbackChip label={label} style={style} />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>{chip}</View>
        )}
      </Pressable>
    );
  }

  return chip;
}
