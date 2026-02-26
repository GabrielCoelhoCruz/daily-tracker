import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import { plano } from "@/data/plano";

type HidratacaoSectionProps = {
  label: string;
  currentMl: number;
  metaMl: number;
  onAdd: (ml: number) => void;
  onRemove: (ml: number) => void;
};

function formatLiters(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)}L`;
  }
  return `${ml}ml`;
}

function HidratacaoSection({
  label,
  currentMl,
  metaMl,
  onAdd,
  onRemove,
}: HidratacaoSectionProps) {
  const percentage = metaMl > 0 ? Math.min(100, Math.round((currentMl / metaMl) * 100)) : 0;
  const isComplete = currentMl >= metaMl;

  function handleAdd(ml: number) {
    animateWithHaptic(() => onAdd(ml));
  }

  function handleRemove(ml: number) {
    animateWithHaptic(() => onRemove(ml));
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="water-outline"
            size={16}
            color={isComplete ? theme.colors.semantic.success : theme.colors.accent.DEFAULT}
          />
          <Text className="text-sm font-semibold text-txt-primary">{label}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          {isComplete && (
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color={theme.colors.semantic.success}
            />
          )}
          <Text
            selectable
            className="text-sm text-txt-secondary"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatLiters(currentMl)} / {formatLiters(metaMl)}
          </Text>
          <Text
            selectable
            className="text-sm font-medium"
            style={{
              fontVariant: ["tabular-nums"],
              color: isComplete
                ? theme.colors.semantic.success
                : theme.colors.accent.DEFAULT,
            }}
          >
            {percentage}%
          </Text>
        </View>
      </View>

      <View className="h-2.5 overflow-hidden rounded-full bg-bg-elevated">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: isComplete
              ? theme.colors.semantic.success
              : theme.colors.accent.DEFAULT,
          }}
        />
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => handleRemove(250)}
          accessibilityLabel={`Remover 250ml de ${label}`}
          hitSlop={4}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <MaterialCommunityIcons
            name="minus-circle-outline"
            size={28}
            color={theme.colors.text.muted}
          />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          <Pressable
            onPress={() => handleAdd(250)}
            accessibilityLabel={`Adicionar 250ml de ${label}`}
            className="flex-1 items-center justify-center rounded-lg py-2"
            style={{ backgroundColor: theme.colors.accent.DEFAULT + "15" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.colors.accent.DEFAULT }}
            >
              +250ml
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleAdd(500)}
            accessibilityLabel={`Adicionar 500ml de ${label}`}
            className="flex-1 items-center justify-center rounded-lg py-2"
            style={{ backgroundColor: theme.colors.accent.DEFAULT + "15" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.colors.accent.DEFAULT }}
            >
              +500ml
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => handleAdd(250)}
          accessibilityLabel={`Adicionar 250ml de ${label}`}
          hitSlop={4}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={28}
            color={theme.colors.accent.DEFAULT}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function HidratacaoCard() {
  const aguaMl = useDayStore((s) => s.aguaMl);
  const chaMl = useDayStore((s) => s.chaMl);
  const addAgua = useDayStore((s) => s.addAgua);
  const removeAgua = useDayStore((s) => s.removeAgua);
  const addCha = useDayStore((s) => s.addCha);
  const removeCha = useDayStore((s) => s.removeCha);

  const { aguaMl: metaAgua, chaMl: metaCha } = plano.metaHidratacao;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons
          name="water"
          size={20}
          color={theme.colors.accent.DEFAULT}
        />
        <Text style={theme.typography.callout}>
          Hidratação
        </Text>
      </View>

      <HidratacaoSection
        label="Água"
        currentMl={aguaMl}
        metaMl={metaAgua}
        onAdd={addAgua}
        onRemove={removeAgua}
      />

      <View className="h-px bg-border" />

      <HidratacaoSection
        label="Chá de Cavalinha"
        currentMl={chaMl}
        metaMl={metaCha}
        onAdd={addCha}
        onRemove={removeCha}
      />
    </Card>
  );
}
