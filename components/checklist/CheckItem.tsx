import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Badge } from "@/components/ui/Badge";
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
      <View className="gap-1">
        <Text
          className="text-sm font-semibold text-txt-secondary"
          style={{ paddingLeft: indented ? 16 : 0 }}
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
      className="flex-row items-center gap-3"
      style={{ minHeight: 44, paddingLeft: indented ? 16 : 0 }}
    >
      <MaterialCommunityIcons
        name={
          isChecked
            ? "checkbox-marked-circle-outline"
            : "checkbox-blank-circle-outline"
        }
        size={24}
        color={
          isChecked
            ? theme.colors.semantic.success
            : theme.colors.text.muted
        }
      />

      <View className="flex-1 flex-row items-center gap-2">
        <Text
          className="text-sm text-txt-primary"
          style={{ opacity: isChecked ? 0.5 : 1 }}
        >
          {item.nome}
        </Text>
        {item.dosagem && (
          <Text
            className="text-xs text-txt-secondary"
            style={{ opacity: isChecked ? 0.5 : 1 }}
          >
            {item.dosagem}
          </Text>
        )}
        {item.opcional && (
          <Badge text="opcional" color={theme.colors.text.muted} />
        )}
      </View>
    </Pressable>
  );
}
