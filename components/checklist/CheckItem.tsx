import { Alert, Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import type { ItemDoPlano } from "@/data/plano";

type CheckItemProps = {
  item: ItemDoPlano;
  indented?: boolean;
};

const SKIP_REASONS = [
  "Sem tempo",
  "Sem fome/apetite",
  "Imprevisto",
  "Escolha própria",
] as const;

export function CheckItem({ item, indented = false }: CheckItemProps) {
  const checks = useDayStore((s) => s.checks);
  const toggleCheck = useDayStore((s) => s.toggleCheck);
  const skipCheck = useDayStore((s) => s.skipCheck);
  const partialCheck = useDayStore((s) => s.partialCheck);
  const check = checks[item.id];
  const isChecked = check?.checked ?? false;
  const isSkipped = check?.skipped ?? false;
  const isPartial = (check?.partial ?? false) && isChecked;
  const isMeal = item.categoria === "refeicao";

  const hasSubItens = item.subItens && item.subItens.length > 0;

  function handlePress() {
    animateWithHaptic(() => toggleCheck(item.id));
  }

  function handleLongPress() {
    if (isChecked && !isPartial) return;
    if (isMeal) {
      Alert.alert("Como foi essa refeição?", item.nome, [
        {
          text: "Feito parcial",
          onPress: () => animateWithHaptic(() => partialCheck(item.id)),
        },
        ...SKIP_REASONS.map((reason) => ({
          text: `Fora do plano · ${reason}`,
          onPress: () => animateWithHaptic(() => skipCheck(item.id, reason)),
        })),
        { text: "Cancelar", style: "cancel" as const },
      ]);
      return;
    }
    if (isChecked) return;
    Alert.alert("Por que pulou?", item.nome, [
      ...SKIP_REASONS.map((reason) => ({
        text: reason,
        onPress: () => animateWithHaptic(() => skipCheck(item.id, reason)),
      })),
      { text: "Cancelar", style: "cancel" as const },
    ]);
  }

  if (hasSubItens) {
    return (
      <View style={{ gap: 6 }}>
        <Text
          style={{
            ...theme.typography.overline,
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
      onLongPress={handleLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={
        isSkipped
          ? `${item.nome}, pulado: ${check?.skipReason}`
          : isPartial
            ? `${item.nome}, feito parcial`
            : item.nome
      }
      accessibilityHint="Toque para marcar. Toque e segure para marcar parcial ou pular com motivo."
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
          <AppIcon
            sf="checkmark"
            mci="check"
            size={12}
            color={theme.colors.background}
            weight="bold"
          />
        )}
        {isSkipped && !isChecked && (
          <AppIcon
            sf="minus"
            mci="minus"
            size={12}
            color={theme.colors.semantic.warning}
            weight="bold"
          />
        )}
      </View>

      {/* Label */}
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            // Sem strikethrough — item feito escurece, não é "riscado" (§3 Motion).
            color:
              isChecked || isSkipped
                ? withAlpha(theme.colors.onSurface.DEFAULT, 0.5)
                : withAlpha(theme.colors.onSurface.DEFAULT, 0.9),
          }}
        >
          {item.nome}
        </Text>
        {isSkipped && !isChecked && (
          <Text
            style={{
              fontSize: 10,
              color: theme.colors.semantic.warning,
            }}
          >
            Pulado · {check?.skipReason}
          </Text>
        )}
        {isPartial && (
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: theme.colors.semantic.warning,
            }}
          >
            Parcial
          </Text>
        )}
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
                ...theme.typography.overline,
                fontSize: 8,
                letterSpacing: 1,
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
