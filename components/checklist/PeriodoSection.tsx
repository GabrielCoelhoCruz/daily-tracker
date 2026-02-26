import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { Badge } from "@/components/ui/Badge";
import { CheckItem } from "@/components/checklist/CheckItem";
import { useDayStore } from "@/stores/useDayStore";
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

  return (
    <View className="rounded-xl border border-border bg-bg-card">
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-base font-semibold text-txt-primary">
            {periodo.nome}
          </Text>
          {periodo.descricao && (
            <Text className="text-xs text-txt-muted">{periodo.descricao}</Text>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <Badge
            text={`${checkedItems}/${totalItems}`}
            color={
              checkedItems === totalItems
                ? theme.colors.semantic.success
                : theme.colors.accent.DEFAULT
            }
          />
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.text.muted}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="gap-1 px-4 pb-4">
          {isRefeicaoLivre ? (
            <View className="items-center rounded-lg bg-bg-elevated py-4">
              <Ionicons
                name="restaurant-outline"
                size={24}
                color={theme.colors.semantic.success}
              />
              <Text
                className="mt-1 text-sm font-medium"
                style={{ color: theme.colors.semantic.success }}
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
