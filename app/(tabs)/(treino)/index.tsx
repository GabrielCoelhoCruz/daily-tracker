import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { DAY_NAMES_FULL } from "@/constants/days";
import { getTreinoDoDia } from "@/utils/diaUtils";
import { useDayStore } from "@/stores/useDayStore";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import {
  FocalExercicioCard,
  ExercicioItem,
} from "@/components/treino/ExercicioItem";
import { AppIcon } from "@/components/ui/AppIcon";
import { DayOfWeekPicker, getInitialWorkoutDay } from "@/components/workout/DayOfWeekPicker";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

export default function TreinoScreen() {
  const todayDay = getLogicalDayOfWeek(new Date());
  const [selectedDay, setSelectedDay] = useState(() => getInitialWorkoutDay(todayDay));
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const bottomPadding = useTabContentBottomPadding();

  const isViewingToday = selectedDay === todayDay;
  const isTodayOff = isViewingToday && diaOffManual;
  const treino = isTodayOff ? null : getTreinoDoDia(selectedDay);
  const dayName = DAY_NAMES_FULL[selectedDay];

  // ─── Rest Day ──────────────────────────────────────────────────────

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

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
            paddingTop: 48,
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: theme.colors.surface.container,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
              marginBottom: 20,
            }}
          >
            <AppIcon
              sf="moon.fill"
              mci="moon-waning-crescent"
              size={36}
              color={theme.colors.onSurface.variant}
            />
          </View>

          <Text style={theme.typography.labelSmall}>{dayName}</Text>
          <Text
            style={{
              ...theme.typography.headlineLarge,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {isTodayOff ? "DIA OFF" : isWeekend ? "DESCANSO" : "SEM TREINO"}
          </Text>
          <Text
            style={{
              ...theme.typography.footnote,
              color: theme.colors.onSurface.variant,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            {isTodayOff
              ? "Treino pausado hoje. Escolha outro dia para ver o protocolo."
              : isWeekend
                ? "Fim de semana — aproveite para recuperar."
                : "Nenhum treino programado para este dia."}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ─── Training Day ──────────────────────────────────────────────────

  const [firstExercise, ...remainingExercises] = treino.exercicios;

  return (
    <ScrollView
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

      {/* ── Header Section ── */}
      <View style={{ marginBottom: 32, marginTop: 20 }}>
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: theme.colors.primary.container,
            marginBottom: 4,
          }}
        >
          {isViewingToday ? "PROTOCOLO • HOJE" : `PROTOCOLO • ${dayName}`}
        </Text>

        <Text style={theme.typography.titleLarge}>{treino.grupoMuscular}</Text>
      </View>

      {/* ── Focal Exercise (first) ── */}
      <View style={{ marginBottom: 8 }}>
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
