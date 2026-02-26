import { useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { theme } from "@/constants/theme";
import { plano } from "@/data/plano";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import { PeriodoSection } from "@/components/checklist/PeriodoSection";
import { HidratacaoCard } from "@/components/hidratacao/HidratacaoCard";
import { CardioCard } from "@/components/cardio/CardioCard";
import { DicasSection } from "@/components/dicas/DicasSection";
import { useDayStore } from "@/stores/useDayStore";
import {
  isDiaDeTreino,
  filtrarItensDoDia,
  contarItens,
} from "@/utils/diaUtils";
import { checkAndReset } from "@/utils/resetUtils";
import { cancelHydrationNotificacoes } from "@/utils/notificationUtils";
import { getLogicalDayOfWeek, formatLogicalDate } from "@/utils/dateUtils";


function countCheckedNonOptional(
  periodos: ReturnType<typeof filtrarItensDoDia>,
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
  const router = useRouter();
  const checks = useDayStore((s) => s.checks);
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

  function handleToggleDiaOff() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDiaOff(!diaOffManual);
  }

  function handleRefeicaoLivre(periodoId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    usarRefeicaoLivre(periodoId);
  }

  function handleDesfazerRefeicaoLivre() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    desfazerRefeicaoLivre();
  }

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text style={theme.typography.headline}>
            {formatLogicalDate(new Date())}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleToggleDiaOff}
            className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: diaOffManual
                ? theme.colors.semantic.error + "20"
                : theme.colors.bg.elevated,
            }}
          >
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={16}
              color={
                diaOffManual
                  ? theme.colors.semantic.error
                  : theme.colors.text.muted
              }
            />
            <Text
              className="text-xs font-medium"
              style={{
                color: diaOffManual
                  ? theme.colors.semantic.error
                  : theme.colors.text.muted,
              }}
            >
              Dia Off
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/config")}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={22}
              color={theme.colors.text.muted}
            />
          </Pressable>
        </View>
      </View>

      <ProgressBar completados={completados} total={total} />

      {treino && !refeicaoLivreUsada && (
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="food-apple-outline"
            size={16}
            color={theme.colors.accent.DEFAULT}
          />
          <Text style={theme.typography.footnote}>Refeição Livre</Text>
          <Badge
            text="0/1"
            color={theme.colors.accent.DEFAULT}
          />
        </View>
      )}
      {treino && refeicaoLivreUsada && (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={16}
              color={theme.colors.semantic.success}
            />
            <Text style={theme.typography.footnote}>Refeição Livre</Text>
            <Badge
              text="1/1"
              color={theme.colors.semantic.success}
            />
          </View>
          <Pressable
            onPress={handleDesfazerRefeicaoLivre}
            className="flex-row items-center gap-1 rounded-lg px-2.5 py-1"
            style={{
              backgroundColor: theme.colors.semantic.error + "15",
            }}
          >
            <MaterialCommunityIcons
              name="undo"
              size={14}
              color={theme.colors.semantic.error}
            />
            <Text
              className="text-xs font-medium"
              style={{ color: theme.colors.semantic.error }}
            >
              Desfazer
            </Text>
          </Pressable>
        </View>
      )}

      {periodosFiltrados.map((periodo) => (
        <View key={periodo.id} className="gap-2">
          <PeriodoSection periodo={periodo} />
          {treino &&
            !refeicaoLivreUsada &&
            periodo.itens.some((i) => i.categoria === "refeicao") && (
              <Pressable
                onPress={() => handleRefeicaoLivre(periodo.id)}
                className="flex-row items-center justify-center gap-2 rounded-lg py-2"
                style={{
                  backgroundColor: theme.colors.accent.DEFAULT + "10",
                }}
              >
                <MaterialCommunityIcons
                  name="food-apple-outline"
                  size={14}
                  color={theme.colors.accent.DEFAULT}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.colors.accent.DEFAULT }}
                >
                  Usar Refeição Livre
                </Text>
              </Pressable>
            )}
        </View>
      ))}

      <HidratacaoCard />

      <CardioCard />

      <DicasSection categoria="nutricao" />
    </ScrollView>
  );
}
