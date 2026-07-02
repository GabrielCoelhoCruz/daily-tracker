import type { ReactNode } from "react";
import { Platform, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type EnterStaggerProps = {
  children: ReactNode;
  /** Stagger slot — delay is index * 80ms. */
  index?: number;
};

/**
 * Staggered fade+slide screen-entry wrapper.
 * Entering animations leave content stuck at `visibility: hidden` on
 * react-native-web, so web renders a plain View.
 */
export function EnterStagger({ children, index = 0 }: EnterStaggerProps) {
  if (Platform.OS === "web") {
    return <View>{children}</View>;
  }

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 80)}>
      {children}
    </Animated.View>
  );
}
