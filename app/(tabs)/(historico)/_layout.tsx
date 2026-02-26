import { Stack } from "expo-router";

export default function HistoricoLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Hist\u00f3rico",
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerTintColor: "#fafaf9",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="dia-detalhe"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1.0],
          title: "Detalhes do Dia",
        }}
      />
    </Stack>
  );
}
