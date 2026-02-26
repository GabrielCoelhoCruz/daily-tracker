import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function formatDate(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("pt-BR", { month: "long" });
  const dayName = DAY_NAMES[now.getDay()];
  return `${dayName}, ${day} de ${month}`;
}

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

  useEffect(() => {
    checkAndReset();
  }, []);

  const dayOfWeek = new Date().getDay();
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

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-txt-primary">
            {formatDate()}
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
            <Ionicons
              name={diaOffManual ? "moon" : "moon-outline"}
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
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.text.muted}
            />
          </Pressable>
        </View>
      </View>

      <ProgressBar completados={completados} total={total} />

      {treino && !refeicaoLivreUsada && (
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="restaurant-outline"
            size={16}
            color={theme.colors.accent.DEFAULT}
          />
          <Text className="text-sm text-txt-secondary">Refeição Livre</Text>
          <Badge
            text="0/1"
            color={theme.colors.accent.DEFAULT}
          />
        </View>
      )}
      {treino && refeicaoLivreUsada && (
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="restaurant-outline"
            size={16}
            color={theme.colors.semantic.success}
          />
          <Text className="text-sm text-txt-secondary">Refeição Livre</Text>
          <Badge
            text="1/1"
            color={theme.colors.semantic.success}
          />
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
                <Ionicons
                  name="restaurant-outline"
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
