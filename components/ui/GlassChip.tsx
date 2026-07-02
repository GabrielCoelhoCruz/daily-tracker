import {
  Pressable,
  Text as RNText,
  View,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { SymbolViewProps } from "expo-symbols";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";
import { glassSolidFallback, glassSurfaceProps } from "@/constants/glassTheme";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  useShouldRenderBlurFallback,
  useShouldRenderGlass,
} from "@/hooks/useShouldRenderGlass";

type GlassChipIcon = {
  sf: SymbolViewProps["name"];
  mci: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type GlassChipTone = "default" | "primary" | "error";

type GlassChipProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: GlassChipIcon;
  tone?: GlassChipTone;
  uppercase?: boolean;
  centered?: boolean;
  accessibilityLabel?: string;
};

function getToneColors(tone: GlassChipTone) {
  if (tone === "primary") {
    return {
      text: theme.colors.primary.DEFAULT,
      border: withAlpha(theme.colors.primary.DEFAULT, 0.15),
      fallbackBg: withAlpha(theme.colors.primary.DEFAULT, 0.06),
    };
  }

  if (tone === "error") {
    return {
      text: theme.colors.semantic.error,
      border: withAlpha(theme.colors.semantic.error, 0.2),
      fallbackBg: withAlpha(theme.colors.semantic.error, 0.1),
    };
  }

  return {
    text: theme.colors.onSurface.DEFAULT,
    border: theme.colors.outline.variant,
    fallbackBg: theme.colors.surface.containerHigh,
  };
}

function ChipContent({
  label,
  icon,
  tone,
  uppercase,
  centered,
}: Pick<GlassChipProps, "label" | "icon" | "tone" | "uppercase" | "centered">) {
  const colors = getToneColors(tone ?? "default");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        gap: icon ? 6 : 0,
      }}
    >
      {icon ? (
        <AppIcon sf={icon.sf} mci={icon.mci} size={uppercase ? 12 : 14} color={colors.text} />
      ) : null}
      <RNText
        style={{
          color: colors.text,
          fontFamily: uppercase ? theme.fonts.mono : undefined,
          fontSize: uppercase ? 9 : 13,
          fontWeight: uppercase ? "400" : "600",
          letterSpacing: uppercase ? 1 : 0,
          textTransform: uppercase ? "uppercase" : "none",
        }}
      >
        {label}
      </RNText>
    </View>
  );
}

function GlassSurfaceChip({
  label,
  icon,
  tone,
  uppercase,
  centered,
  style,
}: Omit<GlassChipProps, "onPress" | "accessibilityLabel">) {
  return (
    <GlassView
      {...glassSurfaceProps}
      style={[
        {
          borderRadius: uppercase ? theme.radius.sm : theme.radius.lg,
          paddingHorizontal: uppercase ? 10 : 14,
          paddingVertical: uppercase ? 4 : 8,
          justifyContent: "center",
        },
        style,
      ]}
    >
      <ChipContent
        label={label}
        icon={icon}
        tone={tone}
        uppercase={uppercase}
        centered={centered}
      />
    </GlassView>
  );
}

function BlurSurfaceChip({
  label,
  icon,
  tone,
  uppercase,
  centered,
  style,
}: Omit<GlassChipProps, "onPress" | "accessibilityLabel">) {
  const colors = getToneColors(tone ?? "default");

  return (
    <BlurView
      tint="dark"
      intensity={80}
      style={[
        {
          borderRadius: uppercase ? theme.radius.sm : theme.radius.lg,
          overflow: "hidden",
          paddingHorizontal: uppercase ? 10 : 14,
          paddingVertical: uppercase ? 4 : 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <ChipContent
        label={label}
        icon={icon}
        tone={tone}
        uppercase={uppercase}
        centered={centered}
      />
    </BlurView>
  );
}

function FallbackChip({
  label,
  icon,
  tone,
  uppercase,
  centered,
  style,
}: Omit<GlassChipProps, "onPress" | "accessibilityLabel">) {
  const colors = getToneColors(tone ?? "default");

  return (
    <View
      style={[
        {
          borderRadius: uppercase ? theme.radius.sm : theme.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.fallbackBg,
          paddingHorizontal: uppercase ? 10 : 14,
          paddingVertical: uppercase ? 4 : 8,
        },
        style,
      ]}
    >
      <ChipContent
        label={label}
        icon={icon}
        tone={tone}
        uppercase={uppercase}
        centered={centered}
      />
    </View>
  );
}

/**
 * Adaptive glass chip for floating status indicators.
 * Liquid Glass on iOS 26+, blur on older iOS, solid elsewhere.
 */
export function GlassChip({
  label,
  onPress,
  style,
  icon,
  tone = "default",
  uppercase = false,
  centered = false,
  accessibilityLabel,
}: GlassChipProps) {
  const shouldRenderGlass = useShouldRenderGlass();
  const shouldRenderBlur = useShouldRenderBlurFallback();

  const chipProps = { label, icon, tone, uppercase, centered, style };

  const chip = shouldRenderGlass ? (
    <GlassSurfaceChip {...chipProps} />
  ) : shouldRenderBlur ? (
    <BlurSurfaceChip {...chipProps} />
  ) : (
    <FallbackChip {...chipProps} />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>{chip}</View>
        )}
      </Pressable>
    );
  }

  return chip;
}
