import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  Text as RNText,
  View,
  ViewStyle,
} from "react-native";
import { Host, HStack, Text } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  glassEffect,
  padding,
  cornerRadius,
} from "@expo/ui/swift-ui/modifiers";
import { theme } from "@/constants/theme";

type GlassChipProps = {
  label: string;
  onPress?: () => void;
  /**
   * iOS 26 only — SF Symbol glyph shown before the label inside the glass surface.
   */
  sfSymbol?: string;
  style?: ViewStyle;
};

// Liquid Glass SwiftUI modifier requires iOS 26+. `glassEffect` is a no-op on
// earlier iOS, so we fall back to a solid translucent View below that threshold
// (and on Android/web, where @expo/ui SwiftUI is unavailable).
const IOS_26_VERSION = 26;

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
  return typeof Platform.Version === "number" && Platform.Version >= IOS_26_VERSION;
}

function SwiftUIGlassChip({ label, sfSymbol, style }: Omit<GlassChipProps, "onPress">) {
  return (
    <Host style={style} matchContents>
      <HStack
        alignment="center"
        spacing={6}
        modifiers={[
          padding({ horizontal: 14, vertical: 8 }),
          glassEffect({ glass: { variant: "regular" }, shape: "capsule" }),
          cornerRadius(theme.radius.lg),
        ]}
      >
        {sfSymbol ? (
          <Text modifiers={[foregroundStyle(theme.colors.onSurface.DEFAULT)]}>
            {sfSymbol}
          </Text>
        ) : null}
        <Text
          modifiers={[
            foregroundStyle(theme.colors.onSurface.DEFAULT),
            font({ size: 13, weight: "semibold" }),
          ]}
        >
          {label}
        </Text>
      </HStack>
    </Host>
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
 * Adaptive glass chip: renders a native SwiftUI Liquid Glass surface on iOS 26+
 * (unless Reduce Transparency is on), and a solid translucent fallback elsewhere.
 * Use only for floating controls/navigation chrome — never for primary content.
 */
export function GlassChip({ label, onPress, sfSymbol, style }: GlassChipProps) {
  const shouldRenderGlass = useShouldRenderGlass();

  if (shouldRenderGlass) {
    const chip = <SwiftUIGlassChip label={label} sfSymbol={sfSymbol} style={style} />;
    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {chip}
        </Pressable>
      );
    }
    return chip;
  }

  const fallback = <FallbackChip label={label} style={style} />;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {({ pressed }) => (
          <View style={[{ opacity: pressed ? 0.7 : 1 }]}>{fallback}</View>
        )}
      </Pressable>
    );
  }

  return fallback;
}
