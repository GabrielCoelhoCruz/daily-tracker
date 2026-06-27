import { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { plano } from "@/data/plano";
import { GlassChip } from "@/components/ui/GlassChip";
import { AppIcon } from "@/components/ui/AppIcon";
import { PeriodoSection } from "@/components/checklist/PeriodoSection";
import { HidratacaoCard } from "@/components/hidratacao/HidratacaoCard";
import { CardioCard } from "@/components/cardio/CardioCard";
import { TodayBriefingCard } from "@/components/home/TodayBriefingCard";
import { DailyMetricsGrid } from "@/components/home/DailyMetricsGrid";
import { TrainingTodayCard } from "@/components/home/TrainingTodayCard";
import { ProtocolTimeline } from "@/components/home/ProtocolTimeline";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useDayStore } from "@/stores/useDayStore";
import { useGymStore } from "@/stores/useGymStore";
import { animateWithHaptic } from "@/utils/animationUtils";
import {
  isDiaDeTreino,
  filtrarItensDoDia,
  getTreinoDoDia,
} from "@/utils/diaUtils";
import { checkAndReset } from "@/utils/resetUtils";
import { cancelHydrationNotificacoes } from "@/utils/notificationUtils";
import {
  formatLogicalDate,
  getLogicalDayOfWeek,
  getLogicalDate,
} from "@/utils/dateUtils";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import {
  getDailyMetricSummaries,
  getNextHomeAction,
  getProtocolTimelineItems,
  getTodayHeaderSubtitle,
  getTodayProtocolProgress,
  getTodayWorkoutSummary,
} from "@/utils/homeUtils";

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
  const sessoesCardio = useDayStore((s) => s.sessoesCardio);
  const prevAguaRef = useRef(aguaMl);
  const scrollRef = useRef<ScrollViewType>(null);
  const checklistOffsetRef = useRef(0);

  useEffect(() => {
    checkAndReset();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const goalMet = aguaMl >= plano.metaHidratacao.aguaMl;
    const wasMetBefore = prevAguaRef.current >= plano.metaHidratacao.aguaMl;
    prevAguaRef.current = aguaMl;

    if (goalMet && !wasMetBefore) {
      cancelHydrationNotificacoes();
    }
  }, [aguaMl]);

  const logicalDate = getLogicalDate(new Date());
  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const treinoDoDia = getTreinoDoDia(dayOfWeek);
  const isTrainingDay = isDiaDeTreino(dayOfWeek, diaOffManual);
  const treino = isTrainingDay ? treinoDoDia : null;

  const periodosFiltrados = useMemo(
    () => filtrarItensDoDia(plano.periodos, dayOfWeek, diaOffManual),
    [dayOfWeek, diaOffManual]
  );

  const cardioMinutos = useMemo(
    () => sessoesCardio.reduce((sum, s) => sum + s.minutos, 0),
    [sessoesCardio]
  );

  const workoutLogged = useGymStore((s) =>
    treino ? Boolean(s.getActiveSessionForTreinoAndDate(treino.id, logicalDate)) : false
  );

  const progress = useMemo(
    () =>
      getTodayProtocolProgress(
        periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId
      ),
    [periodosFiltrados, checks, refeicaoLivreUsada, refeicaoLivrePeriodoId]
  );

  const nextAction = useMemo(
    () =>
      getNextHomeAction({
        periodos: periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId,
        aguaMl,
        metaAguaMl: plano.metaHidratacao.aguaMl,
        cardioMinutos,
        metaCardioMin: plano.metaCardioMin,
        isTrainingDay,
        treino,
        workoutLogged,
      }),
    [
      periodosFiltrados,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId,
      aguaMl,
      cardioMinutos,
      isTrainingDay,
      treino,
      workoutLogged,
    ]
  );

  const metrics = useMemo(
    () =>
      getDailyMetricSummaries({
        periodos: periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId,
        aguaMl,
        metaAguaMl: plano.metaHidratacao.aguaMl,
        cardioMinutos,
        metaCardioMin: plano.metaCardioMin,
        isTrainingDay,
        diaOffManual,
        treino,
      }),
    [
      periodosFiltrados,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId,
      aguaMl,
      cardioMinutos,
      isTrainingDay,
      diaOffManual,
      treino,
    ]
  );

  const timelineItems = useMemo(
    () =>
      getProtocolTimelineItems(
        periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId
      ),
    [periodosFiltrados, checks, refeicaoLivreUsada, refeicaoLivrePeriodoId]
  );

  const workoutSummary = useMemo(
    () =>
      getTodayWorkoutSummary({
        isTrainingDay,
        diaOffManual,
        treino,
      }),
    [isTrainingDay, diaOffManual, treino]
  );

  const headerSubtitle = useMemo(
    () =>
      getTodayHeaderSubtitle({
        isTrainingDay,
        diaOffManual,
        treino,
      }),
    [isTrainingDay, diaOffManual, treino]
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

  function handleOpenChecklist() {
    scrollRef.current?.scrollTo({
      y: checklistOffsetRef.current,
      animated: true,
    });
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: bottomPadding,
      }}
    >
      {/* ── Today header ── */}
      <View style={{ paddingTop: 8, paddingBottom: 20, gap: 4 }}>
        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 34,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          Hoje
        </Text>
        <Text style={{ ...theme.typography.footnote, fontSize: 15 }}>
          {formatLogicalDate(new Date())}
        </Text>
        <Text
          style={{
            ...theme.typography.callout,
            color: theme.colors.primary.DEFAULT,
            marginTop: 2,
          }}
        >
          {headerSubtitle}
        </Text>
      </View>

      {/* ── Today Briefing ── */}
      <View style={{ gap: 20, marginBottom: 28 }}>
        <TodayBriefingCard
          progress={progress}
          nextAction={nextAction}
          onOpenChecklist={handleOpenChecklist}
        />
        <DailyMetricsGrid metrics={metrics} />
        <TrainingTodayCard summary={workoutSummary} />
      </View>

      {/* ── Protocol timeline ── */}
      <View style={{ marginBottom: 28 }}>
        <HomeSectionHeader title="PROTOCOLO" />
        <ProtocolTimeline items={timelineItems} />
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

      {/* ── Section: Detailed Checklist ── */}
      <View
        style={{ gap: 16 }}
        onLayout={(event) => {
          checklistOffsetRef.current = event.nativeEvent.layout.y;
        }}
      >
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
            CHECKLIST DETALHADO
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
    </ScrollView>
  );
}
