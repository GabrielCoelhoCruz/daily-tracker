import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// NativeTabs liquid-glass bar is slightly taller than legacy Tabs on iOS.
const TAB_BAR_VISIBLE_HEIGHT = Platform.OS === "ios" ? 72 : 68;

// Extra breathing room between the last card and the tab bar.
const CONTENT_GAP = 24;

/**
 * Returns the bottom padding a scrollable screen should apply so its content
 * always clears the tab bar, regardless of device safe-area inset.
 */
export function useTabContentBottomPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_VISIBLE_HEIGHT + bottom + CONTENT_GAP;
}
