import { LayoutAnimation } from "react-native";
import * as Haptics from "expo-haptics";

export function animateNext() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export function animateWithHaptic(callback: () => void) {
  if (process.env.EXPO_OS === "ios") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  callback();
}
