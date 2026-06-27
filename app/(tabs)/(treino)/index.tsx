import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { DAY_NAMES_FULL } from "@/constants/days";
import { getTreinoDoDia } from "@/utils/diaUtils";
import { useDayStore } from "@/stores/useDayStore";
import { useGymStore } from "@/stores/useGymStore";
import { getLogicalDayOfWeek, getLogicalDate } from "@/utils/dateUtils";
import { GymLogPanel } from "@/components/treino/GymLogPanel";
import {
  FocalExercicioCard,
  ExercicioItem,
} from "@/components/treino/ExercicioItem";
import { DayOfWeekPicker, getInitialWorkoutDay } from "@/components/workout/DayOfWeekPicker";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import { useGymSessionForToday } from "@/hooks/useGymSession";
import { TrainingSessionHeader } from "@/components/training/TrainingSessionHeader";
import { CurrentLiftCard } from "@/components/training/CurrentLiftCard";
import { TrainingProgressRail } from "@/components/training/TrainingProgressRail";
import { UpcomingExercisesCard } from "@/components/training/UpcomingExercisesCard";
import { WorkoutRecoveryState } from "@/components/training/WorkoutRecoveryState";
import {
  getCurrentTrainingExercise,
  getPreviousLoadForExercise,
  getSuggestedLoad,
  getTrainingProgress,
  getTrainingSessionSummary,
  getUpcomingTrainingExercises,
} from "@/utils/trainingSessionUtils";

export default function TreinoScreen() {
  const todayDay = getLogicalDayOfWeek(new Date());
  const todayDate = getLogicalDate(new Date());
  const [selectedDay, setSelectedDay] = useState(() => getInitialWorkoutDay(todayDay));
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const gymSessions = useGymStore((s) => Object.values(s.gymSessions));
  const bottomPadding = useTabContentBottomPadding();
  const scrollViewRef = useRef<ScrollView>(null);
  const [gymLogPanelY, setGymLogPanelY] = useState(0);

  const isViewingToday = selectedDay === todayDay;
  const isTodayOff = isViewingToday && diaOffManual;
  const treino = isTodayOff ? null : getTreinoDoDia(selectedDay);
  const dayName = DAY_NAMES_FULL[selectedDay];
  const showGymLog = isViewingToday && !diaOffManual && treino != null;

  const { session, startSession } = useGymSessionForToday(
    showGymLog ? treino : null,
    todayDate,
  );

  const sessionSummary = getTrainingSessionSummary({
    selectedDay,
    todayDay,
    diaOffManual,
    treino,
  });

  const handleScrollToGymLog = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(gymLogPanelY - 16, 0),
      animated: true,
    });
  };

  const handlePrimaryLiftAction = () => {
    if (!session) {
      startSession();
      return;
    }
    handleScrollToGymLog();
  };

  // ─── Rest / Day Off ────────────────────────────────────────────────

  if (!treino) {
    const isWeekend = selectedDay === 0 || selectedDay === 6;

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
        <DayOfWeekPicker
          selectedDay={selectedDay}
          todayDay={todayDay}
          diaOffManual={diaOffManual}
          onSelectDay={setSelectedDay}
        />

        <WorkoutRecoveryState
          summary={sessionSummary}
          dayName={dayName}
          isWeekend={isWeekend}
        />
      </ScrollView>
    );
  }

  // ─── Training Day ──────────────────────────────────────────────────

  const [firstExercise, ...remainingExercises] = treino.exercicios;
  const currentExercise = getCurrentTrainingExercise(treino.exercicios, session);
  const progress = getTrainingProgress(treino.exercicios, session);
  const previousLoadKg = getPreviousLoadForExercise(
    currentExercise.exerciseId,
    todayDate,
    gymSessions,
  );
  const suggestedLoadKg = getSuggestedLoad(previousLoadKg);
  const upcomingExercises = getUpcomingTrainingExercises(
    treino.exercicios,
    currentExercise.index,
    3,
  );
  const isFinalLift = currentExercise.index === treino.exercicios.length - 1;

  return (
    <ScrollView
      ref={scrollViewRef}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: bottomPadding,
        paddingTop: 8,
      }}
    >
      <DayOfWeekPicker
        selectedDay={selectedDay}
        todayDay={todayDay}
        diaOffManual={diaOffManual}
        onSelectDay={setSelectedDay}
      />

      <TrainingSessionHeader
        summary={sessionSummary}
        isViewingToday={isViewingToday}
        dayName={dayName}
      />

      <CurrentLiftCard
        currentExercise={currentExercise}
        previousLoadKg={previousLoadKg}
        suggestedLoadKg={suggestedLoadKg}
        hasSession={session != null}
        showPrimaryAction={showGymLog}
        onPrimaryAction={handlePrimaryLiftAction}
      />

      <TrainingProgressRail
        progress={progress}
        exercicios={treino.exercicios}
        session={session}
        currentIndex={currentExercise.index}
      />

      <UpcomingExercisesCard
        upcomingExercises={upcomingExercises}
        isFinalLift={isFinalLift}
      />

      <View
        onLayout={(event) => {
          setGymLogPanelY(event.nativeEvent.layout.y);
        }}
      >
        <GymLogPanel treino={treino} date={todayDate} visible={showGymLog} />
      </View>

      {/* ── Full Protocol ── */}
      <View style={{ marginBottom: 8, marginTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
            paddingBottom: 12,
            marginBottom: 16,
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              ...theme.typography.labelSmall,
              color: withAlpha(theme.colors.onSurface.variant, 0.6),
            }}
          >
            Full Protocol
          </Text>
        </View>

        <FocalExercicioCard exercicio={firstExercise} index={0} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              fontWeight: "900",
              color: withAlpha(theme.colors.onSurface.variant, 0.4),
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Grupo:
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surface.containerHigh,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                color: theme.colors.onSurface.DEFAULT,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {treino.grupoMuscular}
            </Text>
          </View>
        </View>
      </View>

      {remainingExercises.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
              paddingBottom: 12,
              marginBottom: 16,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                ...theme.typography.labelSmall,
                color: withAlpha(theme.colors.onSurface.variant, 0.6),
              }}
            >
              PRÓXIMOS NO PROTOCOLO
            </Text>
            <Text
              style={{
                ...theme.typography.labelSmall,
                color: withAlpha(theme.colors.onSurface.variant, 0.4),
              }}
            >
              {remainingExercises.length} restantes
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {remainingExercises.map((exercicio, index) => (
              <ExercicioItem
                key={exercicio.id}
                exercicio={exercicio}
                index={index + 1}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
