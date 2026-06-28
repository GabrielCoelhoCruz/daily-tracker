import { useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { plano } from "@/data/plano";
import { GlassChip } from "@/components/ui/GlassChip";
import { AppIcon } from "@/components/ui/AppIcon";
import { PeriodoSection } from "@/components/checklist/PeriodoSection";
import { HidratacaoCard } from "@/components/hidratacao/HidratacaoCard";
import { CardioCard } from "@/components/cardio/CardioCard";
import { ScreenSubtitle } from "@/components/ui/ScreenSubtitle";
import { useDayStore } from "@/stores/useDayStore";
import { useSplitStore } from "@/stores/useSplitStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import {
  isDiaDeTreino,
  filtrarItensDoDia,
} from "@/utils/diaUtils";
import { checkAndReset } from "@/utils/resetUtils";
import { cancelHydrationNotificacoes } from "@/utils/notificationUtils";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

export default function ProtocolScreen() {
  const bottomPadding = useTabContentBottomPadding();
  const checks = useDayStore((s) => s.checks);
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const splitWeekPlan = useSplitStore((s) => s.splitWeekPlan);
  const setDiaOff = useDayStore((s) => s.setDiaOff);
  const refeicaoLivreUsada = useDayStore((s) => s.refeicaoLivreUsada);
  const usarRefeicaoLivre = useDayStore((s) => s.usarRefeicaoLivre);
  const desfazerRefeicaoLivre = useDayStore((s) => s.desfazerRefeicaoLivre);
  const aguaMl = useDayStore((s) => s.aguaMl);

  useEffect(() => {
    checkAndReset();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (aguaMl >= plano.metaHidratacao.aguaMl) {
      cancelHydrationNotificacoes();
    }
  }, [aguaMl]);

  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const isTrainingDay = isDiaDeTreino(dayOfWeek, diaOffManual, splitWeekPlan);

  const periodosFiltrados = useMemo(
    () => filtrarItensDoDia(plano.periodos, dayOfWeek, diaOffManual),
    [dayOfWeek, diaOffManual],
  );

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
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: bottomPadding,
      }}
    >
      <ScreenSubtitle
        text="Protocolo do Dia"
        secondary="Protocolo completo de hoje"
      />

      <View style={{ gap: 16, marginBottom: 40 }}>
        <HidratacaoCard />
        <CardioCard />
      </View>

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
            PROTOCOLO DO DIA
          </Text>

          {isTrainingDay && refeicaoLivreUsada && (
            <GlassChip
              label="Desfazer livre"
              tone="error"
              uppercase
              onPress={handleDesfazerRefeicaoLivre}
              accessibilityLabel="Desfazer refeição livre"
              icon={{ sf: "arrow.uturn.backward", mci: "undo" }}
            />
          )}
        </View>

        {periodosFiltrados.map((periodo) => (
          <View key={periodo.id} style={{ gap: 8 }}>
            <PeriodoSection periodo={periodo} />

            {isTrainingDay &&
              !refeicaoLivreUsada &&
              periodo.itens.some((i) => i.categoria === "refeicao") && (
                <GlassChip
                  label="Usar refeição livre"
                  tone="primary"
                  uppercase
                  centered
                  onPress={() => handleRefeicaoLivre(periodo.id)}
                  accessibilityLabel={`Usar refeição livre em ${periodo.nome}`}
                  icon={{ sf: "fork.knife", mci: "food-apple-outline" }}
                  style={{ paddingVertical: 10 }}
                />
              )}
          </View>
        ))}
      </View>

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
          marginTop: 32,
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <AppIcon
            sf="moon.fill"
            mci="moon-waning-crescent"
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
    </ScrollView>
  );
}
