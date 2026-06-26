import { useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";
import { plano } from "@/data/plano";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PeriodoSection } from "@/components/checklist/PeriodoSection";
import { HidratacaoCard } from "@/components/hidratacao/HidratacaoCard";
import { CardioCard } from "@/components/cardio/CardioCard";
import { useDayStore } from "@/stores/useDayStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import {
  isDiaDeTreino,
  filtrarItensDoDia,
  contarItens,
} from "@/utils/diaUtils";
import { checkAndReset } from "@/utils/resetUtils";
import { cancelHydrationNotificacoes } from "@/utils/notificationUtils";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import type { Periodo } from "@/data/plano";

function countCheckedNonOptional(
  periodos: Periodo[],
  checks: Record<string, { checked: boolean; timestamp: number }>,
  refeicaoLivreUsada: boolean,
  refeicaoLivrePeriodoId: string | null
): number {
  let count = 0;
  for (const periodo of periodos) {
    const isRefeicaoLivre =
      refeicaoLivreUsada && refeicaoLivrePeriodoId === periodo.id;

    for (const item of periodo.itens) {
      if (item.subItens && item.subItens.length > 0) {
        for (const sub of item.subItens) {
          if (!sub.opcional) {
            if (isRefeicaoLivre || checks[sub.id]?.checked) count++;
          }
        }
      } else {
        if (!item.opcional) {
          if (isRefeicaoLivre || checks[item.id]?.checked) count++;
        }
      }
    }
  }
  return count;
}

export default function HojeScreen() {
  const checks = useDayStore((s) => s.checks);
  const bottomPadding = useTabContentBottomPadding();
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const setDiaOff = useDayStore((s) => s.setDiaOff);
  const refeicaoLivreUsada = useDayStore((s) => s.refeicaoLivreUsada);
  const refeicaoLivrePeriodoId = useDayStore((s) => s.refeicaoLivrePeriodoId);
  const usarRefeicaoLivre = useDayStore((s) => s.usarRefeicaoLivre);
  const desfazerRefeicaoLivre = useDayStore((s) => s.desfazerRefeicaoLivre);
  const aguaMl = useDayStore((s) => s.aguaMl);
  const prevAguaRef = useRef(aguaMl);

  useEffect(() => {
    checkAndReset();
  }, []);

  // Cancel hydration notifications when water goal is met
  useEffect(() => {
    if (Platform.OS === "web") return;
    const goalMet = aguaMl >= plano.metaHidratacao.aguaMl;
    const wasMetBefore = prevAguaRef.current >= plano.metaHidratacao.aguaMl;
    prevAguaRef.current = aguaMl;

    if (goalMet && !wasMetBefore) {
      cancelHydrationNotificacoes();
    }
  }, [aguaMl]);

  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const treino = isDiaDeTreino(dayOfWeek, diaOffManual);

  const periodosFiltrados = useMemo(
    () => filtrarItensDoDia(plano.periodos, dayOfWeek, diaOffManual),
    [dayOfWeek, diaOffManual]
  );

  const { total } = useMemo(
    () => contarItens(periodosFiltrados),
    [periodosFiltrados]
  );

  const completados = countCheckedNonOptional(
    periodosFiltrados,
    checks,
    refeicaoLivreUsada,
    refeicaoLivrePeriodoId
  );

  const percentage = total > 0 ? Math.round((completados / total) * 100) : 0;

  function handleToggleDiaOff() {
    animateWithHaptic(() => setDiaOff(!diaOffManual));
  }

  function handleRefeicaoLivre(periodoId: string) {
    animateWithHaptic(() => usarRefeicaoLivre(periodoId));
  }

  function handleDesfazerRefeicaoLivre() {
    animateWithHaptic(() => desfazerRefeicaoLivre());
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: bottomPadding,
        }}
      >
        {/* ── Circular Progress ── */}
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <CircularProgress percentage={percentage} />
        </View>

        {/* ── Day Off Toggle ── */}
        <Pressable
          onPress={handleToggleDiaOff}
          accessibilityRole="button"
          accessibilityLabel={
            diaOffManual ? "Desativar Dia Off" : "Ativar Dia Off"
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: diaOffManual
              ? withAlpha(theme.colors.semantic.error, 0.08)
              : withAlpha(theme.colors.surface.variant, 0.3),
            borderWidth: 1,
            borderColor: diaOffManual
              ? withAlpha(theme.colors.semantic.error, 0.2)
              : "rgba(255,255,255,0.05)",
            marginBottom: 32,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={20}
              color={
                diaOffManual
                  ? theme.colors.semantic.error
                  : theme.colors.onSurface.variant
              }
            />
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: diaOffManual
                    ? theme.colors.semantic.error
                    : theme.colors.onSurface.DEFAULT,
                }}
              >
                Dia Off
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.onSurface.variant,
                  marginTop: 2,
                }}
              >
                {diaOffManual
                  ? "Treino e dieta pausados"
                  : "Pausar treino e dieta"}
              </Text>
            </View>
          </View>

          {/* Toggle indicator */}
          <View
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: diaOffManual
                ? theme.colors.semantic.error
                : theme.colors.surface.containerHighest,
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: diaOffManual
                  ? theme.colors.onSurface.DEFAULT
                  : theme.colors.onSurface.variant,
                alignSelf: diaOffManual ? "flex-end" : "flex-start",
              }}
            />
          </View>
        </Pressable>

        {/* ── Section: Essenciais ── */}
        <View style={{ gap: 16, marginBottom: 40 }}>
          <Text
            style={{
              ...theme.typography.labelMedium,
              color: theme.colors.onSurface.variant,
              paddingHorizontal: 4,
            }}
          >
            ESSENCIAIS DO DIA
          </Text>

          <HidratacaoCard />
          <CardioCard />
        </View>

        {/* ── Section: Nutrição & Dieta ── */}
        <View style={{ gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                ...theme.typography.labelMedium,
                color: theme.colors.onSurface.variant,
              }}
            >
              NUTRIÇÃO & DIETA
            </Text>

            {/* Free meal status */}
            {treino && refeicaoLivreUsada && (
              <Pressable
                onPress={handleDesfazerRefeicaoLivre}
                accessibilityLabel="Desfazer refeição livre"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: withAlpha(
                    theme.colors.semantic.error,
                    0.1
                  ),
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="undo"
                  size={12}
                  color={theme.colors.semantic.error}
                />
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "800",
                    color: theme.colors.semantic.error,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  DESFAZER LIVRE
                </Text>
              </Pressable>
            )}
          </View>

          {periodosFiltrados.map((periodo) => (
            <View key={periodo.id} style={{ gap: 8 }}>
              <PeriodoSection periodo={periodo} />

              {/* Refeição Livre button for this period */}
              {treino &&
                !refeicaoLivreUsada &&
                periodo.itens.some((i) => i.categoria === "refeicao") && (
                  <Pressable
                    onPress={() => handleRefeicaoLivre(periodo.id)}
                    accessibilityLabel={`Usar refeição livre em ${periodo.nome}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 10,
                      backgroundColor: withAlpha(
                        theme.colors.primary.DEFAULT,
                        0.06
                      ),
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: withAlpha(
                        theme.colors.primary.DEFAULT,
                        0.15
                      ),
                    }}
                  >
                    <MaterialCommunityIcons
                      name="food-apple-outline"
                      size={14}
                      color={theme.colors.primary.DEFAULT}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: theme.colors.primary.DEFAULT,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      USAR REFEIÇÃO LIVRE
                    </Text>
                  </Pressable>
                )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
