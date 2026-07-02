import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { theme, withAlpha } from "@/constants/theme";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import { useActivePlano } from "@/stores/useProtocolStore";

export function CardioCard() {
  const plano = useActivePlano();
  const sessoesCardio = useDayStore((s) => s.sessoesCardio);
  const addSessaoCardio = useDayStore((s) => s.addSessaoCardio);
  const removeSessaoCardio = useDayStore((s) => s.removeSessaoCardio);

  const [inputMinutos, setInputMinutos] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const metaMinutos = plano.metaCardioMin;
  const totalMinutos = sessoesCardio.reduce((sum, s) => sum + s.minutos, 0);
  const percentage = metaMinutos > 0
    ? Math.min(100, Math.round((totalMinutos / metaMinutos) * 100))
    : 0;
  const isComplete = totalMinutos >= metaMinutos;

  function handleAddSessao() {
    const minutos = parseInt(inputMinutos, 10);
    if (isNaN(minutos) || minutos <= 0) {
      setInputError("Informe a duração do cardio antes de finalizar.");
      return;
    }
    if (minutos > 240) {
      setInputError("Duração máxima por sessão: 240 minutos.");
      return;
    }
    setInputError(null);
    animateWithHaptic(() => {
      addSessaoCardio(minutos);
      setInputMinutos("");
    });
  }

  function handleChangeMinutos(text: string) {
    setInputMinutos(text);
    if (inputError) setInputError(null);
  }

  function handleRemoveSessao(index: number) {
    animateWithHaptic(() => removeSessaoCardio(index));
  }

  return (
    <LinearGradient
      colors={[
        withAlpha(theme.colors.surface.variant, 0.4),
        withAlpha(theme.colors.surface.DEFAULT, 0.4),
      ]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.08),
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <MaterialCommunityIcons
            name="run-fast"
            size={20}
            color={theme.colors.primary.DEFAULT}
          />
          <Text
            style={{
              ...theme.typography.labelMedium,
              color: theme.colors.onSurface.DEFAULT,
            }}
          >
            REGISTRO DE CARDIO
          </Text>
        </View>
        {isComplete && (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={theme.colors.tertiary}
          />
        )}
      </View>

      {/* Progress */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.onSurface.DEFAULT,
                fontVariant: ["tabular-nums"],
              }}
            >
              {totalMinutos}
            </Text>
            <Text
              style={{
                ...theme.typography.overline,
                fontSize: 10,
              }}
            >
              / {metaMinutos}min
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isComplete
                ? theme.colors.tertiary
                : theme.colors.primary.DEFAULT,
              fontVariant: ["tabular-nums"],
            }}
          >
            {percentage}%
          </Text>
        </View>
        <View
          style={{
            height: 5,
            backgroundColor: theme.colors.surface.containerHighest,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${percentage}%`,
              borderRadius: 3,
              backgroundColor: isComplete
                ? theme.colors.tertiary
                : theme.colors.primary.DEFAULT,
            }}
          />
        </View>
      </View>

      {/* Session list */}
      {sessoesCardio.length > 0 && (
        <View style={{ gap: 8, marginBottom: 16 }}>
          {sessoesCardio.map((sessao, index) => (
            <View
              key={`${index}-${sessao.timestamp}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: withAlpha(theme.colors.background, 0.6),
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: withAlpha(theme.colors.outline.variant, 0.2),
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.colors.onSurface.variant}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.onSurface.DEFAULT,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {sessao.minutos}min
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemoveSessao(index)}
                accessibilityLabel={`Remover sessão de ${sessao.minutos} minutos`}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={16}
                  color={theme.colors.onSurface.variant}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...theme.typography.overline,
              fontSize: 9,
              letterSpacing: 2,
              marginBottom: 6,
              marginLeft: 4,
            }}
          >
            DURAÇÃO (MIN)
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.outline.variant, 0.3),
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.onSurface.DEFAULT,
              textAlign: "center",
            }}
            placeholder="00"
            placeholderTextColor={theme.colors.surface.containerHighest}
            keyboardType="number-pad"
            value={inputMinutos}
            onChangeText={handleChangeMinutos}
            onSubmitEditing={handleAddSessao}
            returnKeyType="done"
            accessibilityLabel="Duração do cardio em minutos"
            testID="cardio-duration-input"
          />
          {inputError ? (
            <Text
              accessibilityLiveRegion="polite"
              style={{
                ...theme.typography.footnote,
                color: theme.colors.semantic.error,
                marginTop: 6,
                marginLeft: 4,
              }}
            >
              {inputError}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleAddSessao}
        accessibilityRole="button"
        accessibilityLabel="Finalizar atividade de cardio"
        testID="cardio-finalize"
        style={{
          marginTop: 16,
          minHeight: 52,
          paddingVertical: 16,
          backgroundColor: theme.colors.accent.DEFAULT,
          borderRadius: theme.radius.lg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            ...theme.typography.callout,
            fontWeight: "700",
            color: theme.colors.primary.onContainer,
            letterSpacing: 0.5,
          }}
        >
          Finalizar atividade
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
