import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { useDayStore } from "@/stores/useDayStore";
import { plano } from "@/data/plano";

export function CardioCard() {
  const sessoesCardio = useDayStore((s) => s.sessoesCardio);
  const addSessaoCardio = useDayStore((s) => s.addSessaoCardio);
  const removeSessaoCardio = useDayStore((s) => s.removeSessaoCardio);

  const [inputMinutos, setInputMinutos] = useState("");

  const metaMinutos = plano.metaCardioMin;
  const totalMinutos = sessoesCardio.reduce((sum, s) => sum + s.minutos, 0);
  const percentage = metaMinutos > 0 ? Math.min(100, Math.round((totalMinutos / metaMinutos) * 100)) : 0;
  const isComplete = totalMinutos >= metaMinutos;

  function handleAddSessao() {
    const minutos = parseInt(inputMinutos, 10);
    if (isNaN(minutos) || minutos <= 0 || minutos > 240) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addSessaoCardio(minutos);
    setInputMinutos("");
  }

  function handleRemoveSessao(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeSessaoCardio(index);
  }

  const totalText =
    sessoesCardio.length > 1
      ? sessoesCardio.map((s) => `${s.minutos}min`).join(" + ") +
        ` = ${totalMinutos}min`
      : `${totalMinutos}min`;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="bicycle-outline"
            size={20}
            color={theme.colors.accent.DEFAULT}
          />
          <Text className="text-base font-semibold text-txt-primary">
            Cardio
          </Text>
        </View>
        {isComplete && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.semantic.success}
          />
        )}
      </View>

      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-txt-secondary">
            {totalMinutos}min / {metaMinutos}min
          </Text>
          <Text
            className="text-sm font-medium"
            style={{
              color: isComplete
                ? theme.colors.semantic.success
                : theme.colors.accent.DEFAULT,
            }}
          >
            {percentage}%
          </Text>
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
      </View>

      {sessoesCardio.length > 0 && (
        <View className="gap-2">
          {sessoesCardio.map((sessao, index) => (
            <View
              key={`${index}-${sessao.timestamp}`}
              className="flex-row items-center justify-between rounded-lg bg-bg-elevated px-3 py-2"
            >
              <Text className="text-sm text-txt-primary">
                {sessao.minutos}min
              </Text>
              <Pressable
                onPress={() => handleRemoveSessao(index)}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.text.muted}
                />
              </Pressable>
            </View>
          ))}

          {sessoesCardio.length > 1 && (
            <Text className="text-xs text-txt-secondary">
              {totalText}
            </Text>
          )}
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 rounded-lg bg-bg-elevated px-3 py-2 text-sm text-txt-primary"
          placeholder="Minutos"
          placeholderTextColor={theme.colors.text.muted}
          keyboardType="number-pad"
          value={inputMinutos}
          onChangeText={setInputMinutos}
          onSubmitEditing={handleAddSessao}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAddSessao}
          className="items-center justify-center rounded-lg px-4 py-2"
          style={{ backgroundColor: theme.colors.accent.DEFAULT + "20" }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.colors.accent.DEFAULT }}
          >
            Adicionar
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
