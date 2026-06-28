import { ScrollView, View } from "react-native";

import { router } from "expo-router";

import { usePhysiqueStore } from "@/stores/usePhysiqueStore";

import { useAthleteStore } from "@/stores/useAthleteStore";

import { useHistoryStore } from "@/stores/useHistoryStore";

import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

import { getLogicalDate } from "@/utils/dateUtils";

import { EvolutionChart } from "@/components/physique/EvolutionChart";

import { ScreenSubtitle } from "@/components/ui/ScreenSubtitle";

import { StageReadinessHero } from "@/components/physique-intelligence/StageReadinessHero";

import { EvidenceSnapshotCard } from "@/components/physique-intelligence/EvidenceSnapshotCard";

import { LatestAISignalCard } from "@/components/physique-intelligence/LatestAISignalCard";

import { PrepExecutionContextCard } from "@/components/physique-intelligence/PrepExecutionContextCard";

import { PhysiqueMetricsGrid } from "@/components/physique-intelligence/PhysiqueMetricsGrid";

import { PhysiqueActionGrid } from "@/components/physique-intelligence/PhysiqueActionGrid";

import { CheckInTimeline } from "@/components/physique-intelligence/CheckInTimeline";

import { PhysiqueEmptyState } from "@/components/physique-intelligence/PhysiqueEmptyState";

import { ProfileRequiredState } from "@/components/physique-intelligence/ProfileRequiredState";

import {

  getCheckInTimelineItems,

  getEvidenceAISignal,

  getEvidenceSnapshot,

  getLatestAISignal,

  getPhysiqueIntelligenceSummary,

  getPhysiquePrepContext,

} from "@/utils/physiqueIntelligenceUtils";



const PROGRESSO_SUBTITLE =

  "Meu shape está evoluindo com base em quais evidências?";



export default function ProgressoScreen() {

  const checkIns = usePhysiqueStore((s) => s.checkIns);

  const lastCategory = usePhysiqueStore((s) => s.lastCategory);

  const dias = useHistoryStore((s) => s.dias);

  const profileComplete = useAthleteStore((s) => s.isProfileComplete)();

  const bottomPadding = useTabContentBottomPadding();

  const todayDate = getLogicalDate(new Date());



  const summary = getPhysiqueIntelligenceSummary(checkIns, { lastCategory });

  const aiSignal = getLatestAISignal(summary.latestCheckIn, summary.checkInCount);

  const evidenceSignal = getEvidenceAISignal(

    summary.latestCheckIn,

    summary.checkInCount,

  );

  const evidenceSnapshot = getEvidenceSnapshot(checkIns, todayDate);

  const prepContext = getPhysiquePrepContext(dias, todayDate);

  const timelineItems = getCheckInTimelineItems(checkIns);



  const handleOpenLatestResult = () => {

    if (!summary.latestCheckIn) return;

    router.push({

      pathname: "./result" as never,

      params: { id: summary.latestCheckIn.id },

    });

  };



  const handleEvidenceAction = () => {

    if (

      evidenceSnapshot.freshnessStatus === "overdue" ||

      evidenceSnapshot.freshnessStatus === "due-soon" ||

      !evidenceSnapshot.hasEvidence

    ) {

      router.push("./new-checkin" as never);

      return;

    }

    handleOpenLatestResult();

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

        <ScreenSubtitle text={PROGRESSO_SUBTITLE} />

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

        <ScreenSubtitle text={PROGRESSO_SUBTITLE} />

        <PhysiqueEmptyState

          onNewCheckIn={handleNewCheckIn}

          onPhotoGuide={handlePhotoGuide}

        />

        <PrepExecutionContextCard context={prepContext} />

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

      <ScreenSubtitle text={PROGRESSO_SUBTITLE} />

      <StageReadinessHero

        summary={summary}



        onPress={handleOpenLatestResult}

      />

      <EvidenceSnapshotCard

        snapshot={evidenceSnapshot}

        onActionPress={handleEvidenceAction}

      />

      <LatestAISignalCard signal={evidenceSignal} />

      <PrepExecutionContextCard context={prepContext} />

      <PhysiqueMetricsGrid summary={summary} />

      <PhysiqueActionGrid

        checkInCount={summary.checkInCount}

        profileComplete={profileComplete}

        onNewCheckIn={handleNewCheckIn}

        onCompare={handleCompare}

        onCategoryFinder={handleCategoryFinder}

        onProfile={handleProfile}

      />

      <CheckInTimeline

        items={timelineItems}

        onItemPress={handleTimelineItemPress}

      />

      <View style={{ gap: 8 }}>

        <EvolutionChart />

      </View>

    </ScrollView>

  );

}

