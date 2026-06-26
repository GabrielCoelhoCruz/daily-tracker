import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";

export function ScreenHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: withAlpha(theme.colors.surface.DEFAULT, 0.95),
        borderBottomWidth: 1,
        borderBottomColor: withAlpha(theme.colors.outline.variant, 0.3),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <MaterialCommunityIcons
          name="robot-industrial"
          size={22}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.colors.primary.DEFAULT,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          DailyTracker
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/config")}
        accessibilityLabel="Configurações"
        accessibilityRole="button"
        hitSlop={8}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: theme.colors.surface.containerHighest,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={18}
          color={theme.colors.onSurface.variant}
        />
      </Pressable>
    </View>
  );
}
