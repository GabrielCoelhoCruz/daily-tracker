import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";

export default function HojeLayout() {
  const router = useRouter();

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
        headerTintColor: theme.colors.text.primary,
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/config")}
            accessibilityLabel="Configurações"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="cog"
              size={22}
              color={theme.colors.text.muted}
            />
          </Pressable>
        ),
      }}
    />
  );
}
