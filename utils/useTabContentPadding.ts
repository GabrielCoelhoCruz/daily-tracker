import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Visible tab bar height *above* the device safe-area inset.
// iOS tab bar total is 88 with 28 of that being bottom safe-area padding;
// Android tab bar is 68 with no inset padding.
const TAB_BAR_VISIBLE_HEIGHT = Platform.OS === "ios" ? 60 : 68;

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
