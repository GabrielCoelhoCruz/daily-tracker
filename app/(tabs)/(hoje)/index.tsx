import { useEffect, useMemo, useRef } from "react";
import { Platform, ScrollView, View } from "react-native";
import { plano } from "@/data/plano";
import { TodayBriefingCard } from "@/components/home/TodayBriefingCard";
import { TrainingTodayCard } from "@/components/home/TrainingTodayCard";
import { DailyMetricsGrid } from "@/components/home/DailyMetricsGrid";
import { DailyProtocolSummaryCard } from "@/components/home/DailyProtocolSummaryCard";
import { ScreenSubtitle } from "@/components/ui/ScreenSubtitle";
import { useDayStore } from "@/stores/useDayStore";
import { useSplitStore } from "@/stores/useSplitStore";
import { useGymStore } from "@/stores/useGymStore";
import {
  isDiaDeTreino,
  filtrarItensDoDia,
  resolveTreinoForDay,
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
  getTodayHeaderSubtitle,
  getTodayProtocolProgress,
} from "@/utils/homeUtils";
import { DailyCloseoutCard } from "@/components/home/DailyCloseoutCard";
import { useHistoryStore } from "@/stores/useHistoryStore";
import {
  getDailyCloseoutSummary,
  toCloseoutHistorico,
  type DailyCloseoutInput,
} from "@/utils/dailyCloseoutUtils";
import { getDailyProtocolSummary } from "@/utils/dailyProtocolSummaryUtils";
import { getTodayTrainingBriefing } from "@/utils/todayTrainingUtils";
import { useRouter } from "expo-router";

export default function HojeScreen() {
  const router = useRouter();
  const checks = useDayStore((s) => s.checks);
  const bottomPadding = useTabContentBottomPadding();
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const treinoHojeId = useDayStore((s) => s.treinoHojeId);
  const splitWeekPlan = useSplitStore((s) => s.splitWeekPlan);
  const refeicaoLivreUsada = useDayStore((s) => s.refeicaoLivreUsada);
  const refeicaoLivrePeriodoId = useDayStore((s) => s.refeicaoLivrePeriodoId);
  const aguaMl = useDayStore((s) => s.aguaMl);
  const sessoesCardio = useDayStore((s) => s.sessoesCardio);
  const prevAguaRef = useRef(aguaMl);

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
  const salvarDia = useHistoryStore((s) => s.salvarDia);
  const savedCloseout = useHistoryStore((s) => s.dias[logicalDate]);
  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const treinoDoDia = resolveTreinoForDay(dayOfWeek, {
    todayDay: dayOfWeek,
    treinoHojeId,
    splitWeekPlan,
  });
  const isTrainingDay = isDiaDeTreino(dayOfWeek, diaOffManual, splitWeekPlan);
  const treino = isTrainingDay ? treinoDoDia : null;

  const periodosFiltrados = useMemo(
    () => filtrarItensDoDia(plano.periodos, dayOfWeek, diaOffManual),
    [dayOfWeek, diaOffManual],
  );

  const cardioMinutos = useMemo(
    () => sessoesCardio.reduce((sum, s) => sum + s.minutos, 0),
    [sessoesCardio],
  );

  const gymSession = useGymStore((s) =>
    treino ? s.getActiveSessionForTreinoAndDate(treino.id, logicalDate) : undefined,
  );

  const trainingBriefing = useMemo(
    () =>
      getTodayTrainingBriefing({
        isTrainingDay,
        diaOffManual,
        treino,
        session: gymSession,
      }),
    [isTrainingDay, diaOffManual, treino, gymSession],
  );

  const workoutComplete = trainingBriefing.status === "complete";

  const closeoutInput = useMemo<DailyCloseoutInput>(
    () => ({
      date: logicalDate,
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
      trainingBriefing,
    }),
    [
      logicalDate,
      periodosFiltrados,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId,
      aguaMl,
      cardioMinutos,
      isTrainingDay,
      diaOffManual,
      trainingBriefing,
    ],
  );

  const closeoutSummary = useMemo(
    () => getDailyCloseoutSummary(closeoutInput),
    [closeoutInput],
  );

  const isCloseoutSaved = Boolean(savedCloseout?.closeoutSavedAt);

  const progress = useMemo(
    () =>
      getTodayProtocolProgress(
        periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId,
      ),
    [periodosFiltrados, checks, refeicaoLivreUsada, refeicaoLivrePeriodoId],
  );

  const protocolSummary = useMemo(
    () =>
      getDailyProtocolSummary({
        periodos: periodosFiltrados,
        checks,
        refeicaoLivreUsada,
        refeicaoLivrePeriodoId,
        aguaMl,
        metaAguaMl: plano.metaHidratacao.aguaMl,
        cardioMinutos,
        metaCardioMin: plano.metaCardioMin,
        diaOffManual,
      }),
    [
      periodosFiltrados,
      checks,
      refeicaoLivreUsada,
      refeicaoLivrePeriodoId,
      aguaMl,
      cardioMinutos,
      diaOffManual,
    ],
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
        workoutLogged: workoutComplete,
        trainingBriefing,
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
      workoutComplete,
      trainingBriefing,
    ],
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
        trainingBriefing,
        kinds: ["diet", "workout"],
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
      trainingBriefing,
    ],
  );

  const headerSubtitle = useMemo(
    () =>
      getTodayHeaderSubtitle({
        isTrainingDay,
        diaOffManual,
        treino,
      }),
    [isTrainingDay, diaOffManual, treino],
  );

  function handleOpenProtocol() {
    router.push("/(tabs)/(hoje)/protocol");
  }

  function handleBriefingAction() {
    if (nextAction.type === "workout") {
      router.push("/(tabs)/(treino)");
      return;
    }
    handleOpenProtocol();
  }

  function handleGoExecute() {
    const primaryLeak = closeoutSummary.primaryLeak;
    if (primaryLeak?.type === "training") {
      router.push("/(tabs)/(treino)");
      return;
    }
    handleOpenProtocol();
  }

  function handleCloseDay(dayNote: string) {
    const historico = toCloseoutHistorico(closeoutInput, dayNote);
    salvarDia(historico);

    if (
      gymSession &&
      trainingBriefing.status !== "complete" &&
      trainingBriefing.status !== "no-training"
    ) {
      useGymStore.getState().finishGymSession(gymSession.id);
    }
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
        text={formatLogicalDate(new Date())}
        secondary={headerSubtitle}
      />

      <View style={{ gap: 20, marginBottom: 28 }}>
        <TodayBriefingCard
          progress={progress}
          nextAction={nextAction}
          onOpenChecklist={handleBriefingAction}
        />
        <DailyMetricsGrid metrics={metrics} />
        <TrainingTodayCard briefing={trainingBriefing} />
        <DailyProtocolSummaryCard summary={protocolSummary} />
        <DailyCloseoutCard
          summary={closeoutSummary}
          isAlreadyClosed={isCloseoutSaved}
          savedNote={savedCloseout?.dayNote}
          onCloseDay={handleCloseDay}
          onGoExecute={handleGoExecute}
        />
      </View>
    </ScrollView>
  );
}
