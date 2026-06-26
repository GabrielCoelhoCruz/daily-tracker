import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { theme, withAlpha } from "@/constants/theme";
import { CheckItem } from "@/components/checklist/CheckItem";
import { useDayStore } from "@/stores/useDayStore";
import { animateNext } from "@/utils/animationUtils";
import type { Periodo, ItemDoPlano } from "@/data/plano";

type PeriodoSectionProps = {
  periodo: Periodo;
};

function countCheckableItems(itens: ItemDoPlano[]): number {
  let count = 0;
  for (const item of itens) {
    if (item.subItens && item.subItens.length > 0) {
      count += item.subItens.length;
    } else {
      count++;
    }
  }
  return count;
}

function countCheckedItems(
  itens: ItemDoPlano[],
  checks: Record<string, { checked: boolean; timestamp: number }>
): number {
  let count = 0;
  for (const item of itens) {
    if (item.subItens && item.subItens.length > 0) {
      for (const sub of item.subItens) {
        if (checks[sub.id]?.checked) count++;
      }
    } else {
      if (checks[item.id]?.checked) count++;
    }
  }
  return count;
}

export function PeriodoSection({ periodo }: PeriodoSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const checks = useDayStore((s) => s.checks);
  const refeicaoLivreUsada = useDayStore((s) => s.refeicaoLivreUsada);
  const refeicaoLivrePeriodoId = useDayStore((s) => s.refeicaoLivrePeriodoId);

  const isRefeicaoLivre =
    refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id;

  const totalItems = countCheckableItems(periodo.itens);
  const checkedItems = isRefeicaoLivre
    ? totalItems
    : countCheckedItems(periodo.itens, checks);
  const isComplete = checkedItems === totalItems;
  const isActive = !isComplete && checkedItems >= 0;

  // ─── Completed state ────────────────────────────────────────────
  if (isComplete) {
    return (
      <LinearGradient
        colors={[
          withAlpha(theme.colors.surface.variant, 0.3),
          withAlpha(theme.colors.surface.DEFAULT, 0.3),
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          opacity: 0.75,
        }}
      >
        <Pressable
          onPress={() => {
            animateNext();
            setExpanded((prev) => !prev);
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${periodo.nome}, concluída`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: withAlpha(theme.colors.tertiary, 0.1),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color={theme.colors.tertiary}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: theme.colors.onSurface.DEFAULT,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {periodo.nome}
              </Text>
              <Text
                style={{
                  ...theme.typography.labelSmall,
                  color: theme.colors.onSurface.variant,
                  marginTop: 2,
                }}
              >
                CONCLUÍDA
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-right"}
            size={18}
            color={theme.colors.onSurface.variant}
          />
        </Pressable>

        {expanded && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 8 }}>
            {isRefeicaoLivre ? (
              <View
                style={{
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: withAlpha(theme.colors.tertiary, 0.08),
                  paddingVertical: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="food-apple"
                  size={24}
                  color={theme.colors.tertiary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: theme.colors.tertiary,
                    marginTop: 4,
                  }}
                >
                  Refeição Livre
                </Text>
              </View>
            ) : (
              periodo.itens.map((item) => (
                <CheckItem key={item.id} item={item} />
              ))
            )}
          </View>
        )}
      </LinearGradient>
    );
  }

  // ─── Active / In Progress state ────────────────────────────────
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isActive
          ? withAlpha(theme.colors.primary.DEFAULT, 0.4)
          : withAlpha(theme.colors.outline.variant, 0.2),
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: theme.colors.primary.DEFAULT,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />

      {/* Header */}
      <Pressable
        onPress={() => {
          animateNext();
          setExpanded((prev) => !prev);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${periodo.nome}, ${checkedItems} de ${totalItems}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
          paddingLeft: 24,
          backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.03),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: theme.colors.primary.container,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={22}
              color={theme.colors.background}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "900",
                color: theme.colors.onSurface.DEFAULT,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {periodo.nome}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary.DEFAULT,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: theme.colors.primary.DEFAULT,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {checkedItems}/{totalItems}
                {periodo.descricao ? ` • ${periodo.descricao}` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.surface.containerHighest,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.primary.DEFAULT}
          />
        </View>
      </Pressable>

      {/* Items */}
      {expanded && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingLeft: 24,
            gap: 8,
            paddingTop: 4,
          }}
        >
          {isRefeicaoLivre ? (
            <View
              style={{
                alignItems: "center",
                borderRadius: 12,
                backgroundColor: withAlpha(theme.colors.tertiary, 0.08),
                paddingVertical: 16,
              }}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={24}
                color={theme.colors.tertiary}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: theme.colors.tertiary,
                  marginTop: 4,
                }}
              >
                Refeição Livre
              </Text>
            </View>
          ) : (
            periodo.itens.map((item) => (
              <CheckItem key={item.id} item={item} />
            ))
          )}
        </View>
      )}
    </View>
  );
}
