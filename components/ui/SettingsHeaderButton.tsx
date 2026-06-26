import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";

/**
 * Header settings control — MaterialCommunityIcons only (SymbolView can render
 * broken glyphs in native stack headerRight on iOS 26 / Expo Go).
 */
export function SettingsHeaderButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/config")}
      accessibilityRole="button"
      accessibilityLabel="Configurações"
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: withAlpha(theme.colors.surface.containerHigh, 0.85),
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
        }}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={20}
          color={theme.colors.onSurface.DEFAULT}
        />
      </View>
    </Pressable>
  );
}
