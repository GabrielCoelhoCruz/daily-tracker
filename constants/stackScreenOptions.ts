import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { theme } from "@/constants/theme";

/** Shared native stack header for tab root screens — transparent for Liquid Glass on iOS 26. */
export const tabStackScreenOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerBlurEffect: "none",
  headerStyle: { backgroundColor: "transparent" },
  headerLargeStyle: { backgroundColor: "transparent" },
  headerTintColor: theme.colors.onSurface.DEFAULT,
  headerBackButtonDisplayMode: "minimal",
};

/** formSheet with transparent content so iOS 26 renders a glass sheet background. */
export const glassSheetScreenOptions: NativeStackNavigationOptions = {
  presentation: "formSheet",
  sheetGrabberVisible: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerBlurEffect: "none",
  headerStyle: { backgroundColor: "transparent" },
  headerTintColor: theme.colors.onSurface.DEFAULT,
  contentStyle: { backgroundColor: "transparent" },
};

/** Pushed detail screens inside tab stacks. */
export const detailStackScreenOptions: NativeStackNavigationOptions = {
  headerTransparent: true,
  headerShadowVisible: false,
  headerBlurEffect: "none",
  headerStyle: { backgroundColor: "transparent" },
  headerTintColor: theme.colors.onSurface.DEFAULT,
  headerBackButtonDisplayMode: "minimal",
};
