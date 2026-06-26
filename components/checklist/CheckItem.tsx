import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import type { ItemDoPlano } from "@/data/plano";

type CheckItemProps = {
  item: ItemDoPlano;
  indented?: boolean;
};

export function CheckItem({ item, indented = false }: CheckItemProps) {
  const checks = useDayStore((s) => s.checks);
  const toggleCheck = useDayStore((s) => s.toggleCheck);
  const isChecked = checks[item.id]?.checked ?? false;

  const hasSubItens = item.subItens && item.subItens.length > 0;

  function handlePress() {
    animateWithHaptic(() => toggleCheck(item.id));
  }

  if (hasSubItens) {
    return (
      <View style={{ gap: 6 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: theme.colors.onSurface.variant,
            letterSpacing: 1,
            textTransform: "uppercase",
            paddingLeft: indented ? 16 : 0,
          }}
        >
          {item.nome}
        </Text>
        {item.subItens!.map((subItem) => (
          <CheckItem key={subItem.id} item={subItem} indented />
        ))}
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={item.nome}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: withAlpha(theme.colors.background, 0.8),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isChecked
          ? withAlpha(theme.colors.tertiary, 0.2)
          : withAlpha(theme.colors.outline.variant, 0.2),
        marginLeft: indented ? 16 : 0,
      }}
    >
      {/* Checkbox */}
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: isChecked
            ? theme.colors.tertiary
            : theme.colors.outline.variant,
          backgroundColor: isChecked
            ? theme.colors.tertiary
            : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isChecked && (
          <MaterialCommunityIcons
            name="check"
            size={12}
            color={theme.colors.background}
          />
        )}
      </View>

      {/* Label */}
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: isChecked
              ? withAlpha(theme.colors.onSurface.DEFAULT, 0.5)
              : withAlpha(theme.colors.onSurface.DEFAULT, 0.9),
            textDecorationLine: isChecked ? "line-through" : "none",
          }}
        >
          {item.nome}
        </Text>
        {item.dosagem && (
          <Text
            style={{
              fontSize: 11,
              fontWeight: "500",
              color: theme.colors.onSurface.variant,
              opacity: isChecked ? 0.5 : 1,
            }}
          >
            {item.dosagem}
          </Text>
        )}
        {item.opcional && (
          <View
            style={{
              backgroundColor: withAlpha(theme.colors.onSurface.variant, 0.15),
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: "800",
                color: theme.colors.onSurface.variant,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              OPC
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
