import { useLayoutEffect, useMemo, useState } from "react";

import { ScrollView } from "react-native";

import { useNavigation } from "expo-router";

import { DAY_NAMES_FULL } from "@/constants/days";

import { resolveTreinoForDay } from "@/utils/diaUtils";

import { getWeekDaySlot } from "@/utils/splitWeekUtils";

import { useDayStore } from "@/stores/useDayStore";

import { useSplitStore } from "@/stores/useSplitStore";

import { useGymStore } from "@/stores/useGymStore";

import { getLogicalDayOfWeek, getLogicalDate } from "@/utils/dateUtils";

import {

  SplitWeekPlanner,

  getInitialWorkoutDay,

} from "@/components/workout/SplitWeekPlanner";

import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

import { useGymSessionForToday } from "@/hooks/useGymSession";

import { TrainingSessionHeader } from "@/components/training/TrainingSessionHeader";

import { CurrentSetCard } from "@/components/training/CurrentSetCard";

import { SessionVolumeCard } from "@/components/training/SessionVolumeCard";

import { RestTimerCard } from "@/components/training/RestTimerCard";

import { ExerciseProgressList } from "@/components/training/ExerciseProgressList";

import { SessionSummaryCard } from "@/components/training/SessionSummaryCard";

import { ExerciseProtocolList } from "@/components/training/ExerciseProtocolList";

import { WorkoutRecoveryState } from "@/components/training/WorkoutRecoveryState";

import {

  getPreviousBestSetDisplay,

  getSuggestedLoad,

  getTrainingSessionSummary,

} from "@/utils/trainingSessionUtils";

import {

  getCompletedSetCount,

  getCurrentSet,

  getTotalSetCount,

} from "@/utils/trainingPerformanceUtils";



export default function TreinoScreen() {

  const todayDay = getLogicalDayOfWeek(new Date());

  const todayDate = getLogicalDate(new Date());

  const splitWeekPlan = useSplitStore((s) => s.splitWeekPlan);

  const setWeekDaySlot = useSplitStore((s) => s.setWeekDaySlot);

  const [selectedDay, setSelectedDay] = useState(() =>

    getInitialWorkoutDay(todayDay, splitWeekPlan),

  );

  const diaOffManual = useDayStore((s) => s.diaOffManual);

  const treinoHojeId = useDayStore((s) => s.treinoHojeId);

  const gymSessionsRecord = useGymStore((s) => s.gymSessions);

  const gymSessions = useMemo(

    () => Object.values(gymSessionsRecord),

    [gymSessionsRecord],

  );

  const bottomPadding = useTabContentBottomPadding();

  const [restTimerActive, setRestTimerActive] = useState(false);



  const isViewingToday = selectedDay === todayDay;

  const isTodayOff = isViewingToday && diaOffManual;

  const selectedSlot = getWeekDaySlot(selectedDay, splitWeekPlan);

  const treino = isTodayOff

    ? null

    : resolveTreinoForDay(selectedDay, {

        todayDay,

        treinoHojeId: isViewingToday ? treinoHojeId : null,

        splitWeekPlan,

      });

  const dayName = DAY_NAMES_FULL[selectedDay];

  const showGymLog = isViewingToday && !diaOffManual && treino != null;



  const {

    session,

    startSession,

    completeSet,

    undoSet,

    finishSession,

  } = useGymSessionForToday(showGymLog ? treino : null, todayDate);



  const sessionSummary = getTrainingSessionSummary({

    selectedDay,

    todayDay,

    diaOffManual,

    treino,

  });



  const navigation = useNavigation();



  useLayoutEffect(() => {

    if (!treino) {

      navigation.setOptions({

        title:

          isTodayOff

            ? "Descanso"

            : selectedSlot.kind === "cardio"

              ? "Cardio"

              : "Treino",

      });

      return;

    }

    navigation.setOptions({ title: `Treino ${treino.letra}` });

  }, [navigation, treino, isTodayOff, selectedSlot.kind]);



  const currentSet = treino ? getCurrentSet(session, treino.exercicios) : null;

  const previousPerformance =

    currentSet && treino

      ? getPreviousBestSetDisplay(

          currentSet.exercicioId,

          todayDate,

          gymSessions,

          treino.exercicios,

        )

      : null;

  const suggestedLoadKg = getSuggestedLoad(

    previousPerformance

      ? Number.parseFloat(previousPerformance.split("kg")[0])

      : null,

  );



  const isSessionComplete =

    session != null &&

    getCompletedSetCount(session) === getTotalSetCount(session) &&

    getTotalSetCount(session) > 0;



  const handleCompleteSet = (data: {

    loadKg: number;

    repsCompleted: number;

    isFailure: boolean;

  }) => {

    if (!currentSet) return;

    completeSet(currentSet.exercicioId, currentSet.set.id, data);

    setRestTimerActive(true);

  };



  const handleUndoSet = () => {

    if (!currentSet) return;

    undoSet(currentSet.exercicioId, currentSet.set.id);

    setRestTimerActive(false);

  };



  const planner = (

    <SplitWeekPlanner

      selectedDay={selectedDay}

      todayDay={todayDay}

      diaOffManual={diaOffManual}

      treinoHojeId={treinoHojeId}

      splitWeekPlan={splitWeekPlan}

      onSelectDay={setSelectedDay}

      onSetWeekDaySlot={setWeekDaySlot}

    />

  );



  if (!treino) {

    const isCardio = selectedSlot.kind === "cardio";



    return (

      <ScrollView

        contentInsetAdjustmentBehavior="automatic"

        contentContainerStyle={{

          flexGrow: 1,

          paddingHorizontal: 24,

          paddingBottom: bottomPadding,

          paddingTop: 8,

        }}

      >

        {planner}



        <WorkoutRecoveryState

          summary={sessionSummary}

          dayName={dayName}

          isWeekend={selectedSlot.kind === "rest"}

          isCardio={isCardio}

        />

      </ScrollView>

    );

  }



  return (

    <ScrollView

      contentInsetAdjustmentBehavior="automatic"

      contentContainerStyle={{

        paddingHorizontal: 24,

        paddingBottom: bottomPadding,

        paddingTop: 8,

      }}

    >

      {planner}



      <TrainingSessionHeader

        summary={sessionSummary}

        isViewingToday={isViewingToday}

        dayName={dayName}

      />



      {isSessionComplete && session ? (

        <SessionSummaryCard

          session={session}

          exercicios={treino.exercicios}

          gymSessions={gymSessions}

          onFinish={finishSession}

        />

      ) : (

        <CurrentSetCard

          currentSet={currentSet}

          previousPerformance={previousPerformance}

          suggestedLoadKg={suggestedLoadKg}

          hasSession={session != null}

          workoutLabel={

            sessionSummary.workoutLabel ?? sessionSummary.title

          }

          showPrimaryAction={showGymLog}

          onStartSession={startSession}

          onCompleteSet={handleCompleteSet}

          onUndoSet={handleUndoSet}

        />

      )}



      <SessionVolumeCard session={session} />



      <RestTimerCard

        setType={currentSet?.set.plannedSetType ?? null}

        active={restTimerActive}

        onComplete={() => setRestTimerActive(false)}

      />



      <ExerciseProgressList

        exercicios={treino.exercicios}

        session={session}

      />



      <ExerciseProtocolList

        exercicios={treino.exercicios}

        currentIndex={currentSet?.exerciseIndex ?? 0}

        session={session}

        muscleGroup={treino.grupoMuscular}

        currentDate={todayDate}

        gymSessions={gymSessions}

      />

    </ScrollView>

  );

}

