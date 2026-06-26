import { Stack } from "expo-router";

export default function HistoricoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="dia-detalhe"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1.0],
        }}
      />
    </Stack>
  );
}
