import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";
import { useAthleteStore } from "@/stores/useAthleteStore";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import { EvolutionChart } from "@/components/physique/EvolutionChart";
import { PhysiqueIntelligenceHeader } from "@/components/physique-intelligence/PhysiqueIntelligenceHeader";
import { StageReadinessHero } from "@/components/physique-intelligence/StageReadinessHero";
import { LatestAISignalCard } from "@/components/physique-intelligence/LatestAISignalCard";
import { PhysiqueMetricsGrid } from "@/components/physique-intelligence/PhysiqueMetricsGrid";
import { PhysiqueActionGrid } from "@/components/physique-intelligence/PhysiqueActionGrid";
import { CheckInTimeline } from "@/components/physique-intelligence/CheckInTimeline";
import { PhysiqueEmptyState } from "@/components/physique-intelligence/PhysiqueEmptyState";
import { ProfileRequiredState } from "@/components/physique-intelligence/ProfileRequiredState";
import {
  getCheckInTimelineItems,
  getLatestAISignal,
  getPhysiqueIntelligenceSummary,
  getStageReadinessTrend,
} from "@/utils/physiqueIntelligenceUtils";

export default function ProgressoScreen() {
  const checkIns = usePhysiqueStore((s) => s.checkIns);
  const lastCategory = usePhysiqueStore((s) => s.lastCategory);
  const profileComplete = useAthleteStore((s) => s.isProfileComplete)();
  const bottomPadding = useTabContentBottomPadding();

  const summary = getPhysiqueIntelligenceSummary(checkIns, { lastCategory });
  const readinessTrend = getStageReadinessTrend(checkIns);
  const aiSignal = getLatestAISignal(summary.latestCheckIn);
  const timelineItems = getCheckInTimelineItems(checkIns);

  const handleOpenLatestResult = () => {
    if (!summary.latestCheckIn) return;
    router.push({
      pathname: "./result" as never,
      params: { id: summary.latestCheckIn.id },
    });
  };

  const handleTimelineItemPress = (id: string) => {
    router.push({
      pathname: "./result" as never,
      params: { id },
    });
  };

  const handleNewCheckIn = () => {
    router.push("./new-checkin" as never);
  };

  const handleCompare = () => {
    router.push("./compare" as never);
  };

  const handleCategoryFinder = () => {
    router.push("./categories" as never);
  };

  const handleProfile = () => {
    router.push("./profile" as never);
  };

  const handlePhotoGuide = () => {
    router.push("./photo-guide" as never);
  };

  const contentStyle = {
    padding: 16,
    paddingBottom: bottomPadding,
    gap: 16,
  };

  if (!profileComplete) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={contentStyle}
      >
        <PhysiqueIntelligenceHeader />
        <ProfileRequiredState onConfigureProfile={handleProfile} />
      </ScrollView>
    );
  }

  if (!summary.hasCheckIns) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={contentStyle}
      >
        <PhysiqueIntelligenceHeader />
        <PhysiqueEmptyState
          onNewCheckIn={handleNewCheckIn}
          onPhotoGuide={handlePhotoGuide}
        />
        <PhysiqueActionGrid
          checkInCount={0}
          profileComplete={profileComplete}
          onNewCheckIn={handleNewCheckIn}
          onCompare={handleCompare}
          onCategoryFinder={handleCategoryFinder}
          onProfile={handleProfile}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={contentStyle}
    >
      <PhysiqueIntelligenceHeader />
      <StageReadinessHero
        summary={summary}
        onPress={handleOpenLatestResult}
      />
      <LatestAISignalCard
        signal={aiSignal}
        latestCheckIn={summary.latestCheckIn}
        onPress={handleOpenLatestResult}
      />
      <PhysiqueMetricsGrid summary={summary} readinessTrend={readinessTrend} />
      <PhysiqueActionGrid
        checkInCount={summary.checkInCount}
        profileComplete={profileComplete}
        onNewCheckIn={handleNewCheckIn}
        onCompare={handleCompare}
        onCategoryFinder={handleCategoryFinder}
        onProfile={handleProfile}
      />
      <View style={{ gap: 8 }}>
        <EvolutionChart />
      </View>
      <CheckInTimeline
        items={timelineItems}
        onItemPress={handleTimelineItemPress}
      />
    </ScrollView>
  );
}
