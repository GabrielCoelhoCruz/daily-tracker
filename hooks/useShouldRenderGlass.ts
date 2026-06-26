import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import Constants from "expo-constants";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

/** Expo Go ships native tab/header glass but custom GlassView/BlurView surfaces show "Unimplemented". */
function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

/** True when expo-glass-effect Liquid Glass should render (iOS 26+, API available, reduce-transparency off). */
export function useShouldRenderGlass() {
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
  if (isExpoGo()) return false;
  if (reduceTransparency) return false;
  return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}

/** True when a frosted blur fallback is appropriate (iOS without liquid glass). */
export function useShouldRenderBlurFallback() {
  const shouldRenderGlass = useShouldRenderGlass();

  if (Platform.OS !== "ios") return false;
  if (isExpoGo()) return false;
  return !shouldRenderGlass;
}
