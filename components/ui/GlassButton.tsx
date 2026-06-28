import { ReactNode } from "react";
import {
  Pressable,
  View,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { theme } from "@/constants/theme";
import { glassSolidFallback, glassSurfaceProps } from "@/constants/glassTheme";
import {
  useShouldRenderBlurFallback,
  useShouldRenderGlass,
} from "@/hooks/useShouldRenderGlass";

type GlassButtonProps = {
  onPress: () => void;
  children: ReactNode;
  accessibilityLabel: string;
  size?: number;
  style?: ViewStyle;
};

function SolidFallbackButton({
  children,
  size,
  style,
}: {
  children: ReactNode;
  size: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: glassSolidFallback.backgroundColor,
          borderWidth: 1,
          borderColor: glassSolidFallback.borderColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Circular interactive glass button (settings gear, share, FAB).
 * Uses expo-glass-effect on iOS 26+, BlurView on older iOS, solid fallback elsewhere.
 */
export function GlassButton({
  onPress,
  children,
  accessibilityLabel,
  size = 38,
  style,
}: GlassButtonProps) {
  const shouldRenderGlass = useShouldRenderGlass();
  const shouldRenderBlur = useShouldRenderBlurFallback();
  const radius = size / 2;

  let surface: ReactNode;
  if (shouldRenderGlass) {
    surface = (
      <GlassView
        {...glassSurfaceProps}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </GlassView>
    );
  } else if (shouldRenderBlur) {
    surface = (
      <BlurView
        tint="dark"
        intensity={80}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: glassSolidFallback.borderColor,
        }}
      >
        {children}
      </BlurView>
    );
  } else {
    surface = (
      <SolidFallbackButton size={size} style={style}>
        {children}
      </SolidFallbackButton>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.75 : 1 }}>{surface}</View>
      )}
    </Pressable>
  );
}
