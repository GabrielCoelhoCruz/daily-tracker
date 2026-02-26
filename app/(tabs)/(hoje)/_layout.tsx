import { Stack } from "expo-router";
import { theme } from "@/constants/theme";

export default function HojeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerTintColor: theme.colors.text.primary,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Hoje",
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
