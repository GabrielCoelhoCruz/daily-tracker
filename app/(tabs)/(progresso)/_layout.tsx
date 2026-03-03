import { Stack } from "expo-router";
import { theme } from "@/constants/theme";

export default function ProgressoLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Progresso",
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerTintColor: theme.colors.text.primary,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="new-checkin"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Novo Check-in",
          headerLargeTitle: false,
          contentStyle: { backgroundColor: theme.colors.bg.card },
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: "Análise",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
