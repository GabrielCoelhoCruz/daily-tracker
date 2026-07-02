import { ScrollView } from "react-native";
import { Alert } from "react-native";

import { router } from "expo-router";

import { usePhysiqueStore } from "@/stores/usePhysiqueStore";

import { useAthleteStore } from "@/stores/useAthleteStore";

import { useHistoryStore } from "@/stores/useHistoryStore";

import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

import { getLogicalDate } from "@/utils/dateUtils";

import { ScreenSubtitle } from "@/components/ui/ScreenSubtitle";

import { EvidenceSnapshotCard } from "@/components/physique-intelligence/EvidenceSnapshotCard";

import { PrepExecutionContextCard } from "@/components/physique-intelligence/PrepExecutionContextCard";

import { PhysiqueMetricsGrid } from "@/components/physique-intelligence/PhysiqueMetricsGrid";

import { PhysiqueActionGrid } from "@/components/physique-intelligence/PhysiqueActionGrid";

import { CheckInTimeline } from "@/components/physique-intelligence/CheckInTimeline";

import { PhysiqueEmptyState } from "@/components/physique-intelligence/PhysiqueEmptyState";

import { ProfileRequiredState } from "@/components/physique-intelligence/ProfileRequiredState";

import {

  getCheckInTimelineItems,

  getEvidenceSnapshot,

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
    Alert.alert(
      "Em breve",
      "O check-in com análise visual por IA estará disponível na próxima versão."
    );
    return;
  };



  const handleTimelineItemPress = (id: string) => {

    router.push({

      pathname: "./result" as never,

      params: { id },

    });

  };



  const handleNewCheckIn = () => {
    Alert.alert(
      "Em breve",
      "O check-in com análise visual por IA estará disponível na próxima versão."
    );
  };



  const handleCompare = () => {

    router.push("./compare" as never);

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

          onNewCheckIn={handleNewCheckIn}

          onCompare={handleCompare}

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

      <EvidenceSnapshotCard

        snapshot={evidenceSnapshot}

        onActionPress={handleEvidenceAction}

      />

      <PrepExecutionContextCard context={prepContext} />

      <PhysiqueMetricsGrid summary={summary} />

      <PhysiqueActionGrid

        checkInCount={summary.checkInCount}

        onNewCheckIn={handleNewCheckIn}

        onCompare={handleCompare}

        onProfile={handleProfile}

      />

      <CheckInTimeline

        items={timelineItems}

        onItemPress={handleTimelineItemPress}

      />

    </ScrollView>

  );

}

