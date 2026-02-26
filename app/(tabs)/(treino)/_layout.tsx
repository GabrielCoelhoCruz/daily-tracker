import { Stack } from "expo-router";
import { theme } from "@/constants/theme";

export default function TreinoLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Treino",
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerTintColor: theme.colors.text.primary,
      }}
    />
  );
}
