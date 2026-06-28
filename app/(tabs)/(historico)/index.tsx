import { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Calendario } from "@/components/historico/Calendario";
import { ScreenSubtitle } from "@/components/ui/ScreenSubtitle";
import { WeeklyReviewCard } from "@/components/history/WeeklyReviewCard";
import { MainLeakCard } from "@/components/history/MainLeakCard";
import { HistoryMetricsGrid } from "@/components/history/HistoryMetricsGrid";
import { RecentDaysList } from "@/components/history/RecentDaysList";
import { HistoryEmptyState } from "@/components/history/HistoryEmptyState";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { getLogicalDate } from "@/utils/dateUtils";
import {
  getWeeklyExecutionReview,
  getRecentDaySummaries,
} from "@/utils/prepReviewUtils";

export default function HistoricoScreen() {
  const router = useRouter();
  const dias = useHistoryStore((s) => s.dias);
  const hasHistory = Object.keys(dias).length > 0;
  const bottomPadding = useTabContentBottomPadding();
  const todayDate = getLogicalDate(new Date());

  const weeklyReview = useMemo(
    () => getWeeklyExecutionReview(dias, todayDate),
    [dias, todayDate],
  );

  const recentDays = useMemo(
    () => getRecentDaySummaries(dias, todayDate, 7),
    [dias, todayDate],
  );

  const handleDayPress = useCallback(
    (dateStr: string) => {
      const historico = dias[dateStr];
      if (historico) {
        router.push(`/dia-detalhe?date=${dateStr}`);
      }
    },
    [dias, router],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: bottomPadding,
        gap: 16,
      }}
    >
      <ScreenSubtitle text="Onde sua execução está vazando?" />

      {hasHistory ? (
        <>
          <WeeklyReviewCard review={weeklyReview} />
          <MainLeakCard
            mainLeak={weeklyReview.mainLeak}
            closedDays={weeklyReview.closedDays}
          />
          <HistoryMetricsGrid review={weeklyReview} />
          <Calendario onDayPress={handleDayPress} />
          <RecentDaysList days={recentDays} onDayPress={handleDayPress} />
        </>
      ) : (
        <HistoryEmptyState />
      )}
    </ScrollView>
  );
}
