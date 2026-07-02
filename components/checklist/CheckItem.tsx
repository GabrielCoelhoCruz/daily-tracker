import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import type { ItemDoPlano } from "@/data/plano";

type CheckItemProps = {
  item: ItemDoPlano;
  indented?: boolean;
};

type ItemAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
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
  const [actionsVisible, setActionsVisible] = useState(false);
  const check = checks[item.id];
  const isChecked = check?.checked ?? false;
  const isSkipped = check?.skipped ?? false;
  const isPartial = (check?.partial ?? false) && isChecked;
  const isMeal = item.categoria === "refeicao";

  const hasSubItens = item.subItens && item.subItens.length > 0;

  function handlePress() {
    animateWithHaptic(() => toggleCheck(item.id));
  }

  const closeActions = () => setActionsVisible(false);

  function runAction(action: () => void) {
    closeActions();
    animateWithHaptic(action);
  }

  const actions: ItemAction[] = isMeal
    ? [
        {
          label: "Feito parcial",
          onPress: () => partialCheck(item.id),
        },
        ...SKIP_REASONS.map((reason) => ({
          label: `Fora do plano · ${reason}`,
          onPress: () => skipCheck(item.id, reason),
          destructive: true,
        })),
      ]
    : SKIP_REASONS.map((reason) => ({
        label: reason,
        onPress: () => skipCheck(item.id, reason),
        destructive: true,
      }));

  function handleLongPress() {
    if (isChecked && !isPartial) return;
    if (!isMeal && isChecked) return;
    setActionsVisible(true);
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
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        testID={`meal-checkbox-${item.id}`}
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

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
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

      <Modal
        visible={actionsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeActions}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar opções do item"
          onPress={closeActions}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 16,
          }}
        >
          <Pressable
            accessibilityRole="menu"
            style={{
              backgroundColor: theme.colors.bg.card,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 12,
              gap: 8,
            }}
          >
            <View style={{ gap: 4, paddingHorizontal: 4, paddingBottom: 4 }}>
              <Text style={theme.typography.callout}>{isMeal ? "Como foi essa refeição?" : "Por que pulou?"}</Text>
              <Text style={theme.typography.caption}>{item.nome}</Text>
            </View>

            {actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                testID={`item-action-${action.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onPress={() => runAction(action.onPress)}
                style={{
                  minHeight: 48,
                  justifyContent: "center",
                  borderRadius: theme.radius.md,
                  backgroundColor: action.destructive
                    ? withAlpha(theme.colors.semantic.warning, 0.12)
                    : withAlpha(theme.colors.tertiary, 0.12),
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    ...theme.typography.body,
                    fontWeight: "600",
                    color: action.destructive
                      ? theme.colors.semantic.warning
                      : theme.colors.tertiary,
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              onPress={closeActions}
              style={{
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ ...theme.typography.body, color: theme.colors.text.secondary }}>
                Cancelar
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
