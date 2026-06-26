import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { theme, withAlpha } from "@/constants/theme";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import { plano } from "@/data/plano";

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(2);
}

function formatGoal(ml: number): string {
  return (ml / 1000).toFixed(1) + "L";
}

// ─── Premium Card wrapper ────────────────────────────────────────────

function PremiumCard({ children }: { children: React.ReactNode }) {
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
        padding: 20,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.08),
      }}
    >
      {children}
    </LinearGradient>
  );
}

// ─── Water Card ──────────────────────────────────────────────────────

function WaterCard() {
  const aguaMl = useDayStore((s) => s.aguaMl);
  const addAgua = useDayStore((s) => s.addAgua);
  const removeAgua = useDayStore((s) => s.removeAgua);
  const metaAgua = plano.metaHidratacao.aguaMl;
  const percentage = Math.min(100, Math.round((aguaMl / metaAgua) * 100));
  const isComplete = aguaMl >= metaAgua;

  return (
    <PremiumCard>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="water-outline"
            size={18}
            color={theme.colors.primary.DEFAULT}
          />
        </View>
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: theme.colors.onSurface.variant,
          }}
        >
          ÁGUA
        </Text>
      </View>

      {/* Value */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: theme.colors.onSurface.DEFAULT,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatLiters(aguaMl)}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "500",
            color: theme.colors.onSurface.variant,
            textTransform: "uppercase",
          }}
        >
          / {formatGoal(metaAgua)}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 5,
          backgroundColor: theme.colors.surface.containerHighest,
          borderRadius: 3,
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[
            withAlpha(theme.colors.primary.DEFAULT, 0.8),
            theme.colors.primary.DEFAULT,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: "100%",
            width: `${percentage}%`,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Action button */}
      {isComplete ? (
        <View
          style={{
            marginTop: 16,
            paddingVertical: 12,
            backgroundColor: withAlpha(theme.colors.tertiary, 0.1),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.tertiary, 0.2),
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: theme.colors.tertiary,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            META BATIDA
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <Pressable
            onPress={() => animateWithHaptic(() => removeAgua(250))}
            accessibilityLabel="Remover 250ml de água"
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: theme.colors.surface.containerHighest,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: theme.colors.onSurface.variant,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              − 250ML
            </Text>
          </Pressable>
          <Pressable
            onPress={() => animateWithHaptic(() => addAgua(250))}
            accessibilityLabel="Adicionar 250ml de água"
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: theme.colors.onSurface.DEFAULT,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: theme.colors.background,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              + 250ML
            </Text>
          </Pressable>
        </View>
      )}
    </PremiumCard>
  );
}

// ─── Tea Card ────────────────────────────────────────────────────────

function TeaCard() {
  const chaMl = useDayStore((s) => s.chaMl);
  const addCha = useDayStore((s) => s.addCha);
  const removeCha = useDayStore((s) => s.removeCha);
  const metaCha = plano.metaHidratacao.chaMl;
  const percentage = Math.min(100, Math.round((chaMl / metaCha) * 100));
  const isComplete = chaMl >= metaCha;

  return (
    <PremiumCard>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: withAlpha(theme.colors.tertiary, 0.1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="tea-outline"
            size={18}
            color={theme.colors.tertiary}
          />
        </View>
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: theme.colors.onSurface.variant,
          }}
        >
          INFUSÃO
        </Text>
      </View>

      {/* Value */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: isComplete
              ? theme.colors.tertiary
              : theme.colors.onSurface.DEFAULT,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatLiters(chaMl)}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "500",
            color: theme.colors.onSurface.variant,
            textTransform: "uppercase",
          }}
        >
          / {formatGoal(metaCha)}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 5,
          backgroundColor: theme.colors.surface.containerHighest,
          borderRadius: 3,
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${percentage}%`,
            borderRadius: 3,
            backgroundColor: theme.colors.tertiary,
          }}
        />
      </View>

      {/* Action */}
      {isComplete ? (
        <View
          style={{
            marginTop: 16,
            paddingVertical: 12,
            backgroundColor: withAlpha(theme.colors.tertiary, 0.1),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.tertiary, 0.2),
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: theme.colors.tertiary,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            META BATIDA
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <Pressable
            onPress={() => animateWithHaptic(() => removeCha(250))}
            accessibilityLabel="Remover 250ml de chá"
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: theme.colors.surface.containerHighest,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: theme.colors.onSurface.variant,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              − 250ML
            </Text>
          </Pressable>
          <Pressable
            onPress={() => animateWithHaptic(() => addCha(250))}
            accessibilityLabel="Adicionar 250ml de chá"
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: theme.colors.onSurface.DEFAULT,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: theme.colors.background,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              + 250ML
            </Text>
          </Pressable>
        </View>
      )}
    </PremiumCard>
  );
}

// ─── Grid Export ──────────────────────────────────────────────────────

export function HidratacaoCard() {
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <View style={{ flex: 1 }}>
        <WaterCard />
      </View>
      <View style={{ flex: 1 }}>
        <TeaCard />
      </View>
    </View>
  );
}
