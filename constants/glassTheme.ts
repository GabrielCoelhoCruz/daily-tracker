import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { theme } from "@/constants/theme";

/** App background — target tone for dark Liquid Glass chrome. */
export const APP_BACKGROUND = theme.colors.bg.primary;

/** Shared props for expo-glass-effect surfaces (dev build / non–Expo Go). */
export const glassSurfaceProps = {
  colorScheme: "dark" as const,
  tintColor: APP_BACKGROUND,
  glassEffectStyle: "regular" as const,
};

/** Native tab bar — dark material aligned with page background. */
export const nativeTabBarGlass = {
  backgroundColor: APP_BACKGROUND,
  blurEffect: "systemChromeMaterialDark" as const,
  disableTransparentOnScrollEdge: true,
};

/** Native stack headers — dark chrome while keeping large-title scroll behavior. */
export const nativeHeaderGlass: Pick<
  NativeStackNavigationOptions,
  "headerBlurEffect" | "headerStyle" | "headerLargeStyle"
> = {
  headerBlurEffect: "systemChromeMaterialDark",
  headerStyle: { backgroundColor: "transparent" },
  headerLargeStyle: { backgroundColor: "transparent" },
};

/** Solid fallback that matches the page when glass APIs are unavailable. */
export const glassSolidFallback = {
  backgroundColor: theme.colors.surface.containerHigh,
  borderColor: theme.colors.outline.variant,
};
