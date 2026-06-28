import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { theme } from "@/constants/theme";
import { nativeHeaderGlass } from "@/constants/glassTheme";

/** Shared native stack header for tab root screens — dark Liquid Glass on iOS 26. */
export const tabStackScreenOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTintColor: theme.colors.onSurface.DEFAULT,
  headerBackButtonDisplayMode: "minimal",
  ...nativeHeaderGlass,
};

/** formSheet with transparent content so iOS 26 renders a dark glass sheet background. */
export const glassSheetScreenOptions: NativeStackNavigationOptions = {
  presentation: "formSheet",
  sheetGrabberVisible: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerTintColor: theme.colors.onSurface.DEFAULT,
  contentStyle: { backgroundColor: "transparent" },
  ...nativeHeaderGlass,
};

/** Pushed detail screens inside tab stacks. */
export const detailStackScreenOptions: NativeStackNavigationOptions = {
  headerTransparent: true,
  headerShadowVisible: false,
  headerTintColor: theme.colors.onSurface.DEFAULT,
  headerBackButtonDisplayMode: "minimal",
  ...nativeHeaderGlass,
};
