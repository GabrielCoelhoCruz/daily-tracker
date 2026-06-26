import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";

type DetailHeaderProps = {
  title: string;
  right?: React.ReactNode;
};

export function DetailHeader({ title, right }: DetailHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: withAlpha(theme.colors.surface.DEFAULT, 0.95),
        borderBottomWidth: 1,
        borderBottomColor: withAlpha(theme.colors.outline.variant, 0.3),
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityLabel="Voltar"
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
          name="arrow-left"
          size={20}
          color={theme.colors.onSurface.DEFAULT}
        />
      </Pressable>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.onSurface.DEFAULT,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
