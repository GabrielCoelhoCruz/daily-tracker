import { Stack } from "expo-router";

export default function HojeLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Hoje",
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerTintColor: "#fafaf9",
      }}
    />
  );
}
