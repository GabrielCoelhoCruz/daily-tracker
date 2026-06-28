import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { DAY_NAMES_SHORT } from "@/constants/days";
import { AppIcon } from "@/components/ui/AppIcon";
import { animateWithHaptic } from "@/utils/animationUtils";
import { resolveTreinoForDay, isTreinoSwappedToday } from "@/utils/diaUtils";
import {
  SPLIT_ASSIGNMENT_OPTIONS,
  WEEK_DAY_ORDER,
  areWeekDaySlotsEqual,
  countWeekPlanTreinoDays,
  formatWeekDaySlotShort,
  getInitialWorkoutDay,
  getWeekDaySlot,
  getWeekDaySlotLetter,
  type SplitWeekPlan,
  type WeekDaySlot,
} from "@/utils/splitWeekUtils";

type SplitWeekPlannerProps = {
  selectedDay: number;
  todayDay: number;
  diaOffManual?: boolean;
  treinoHojeId?: string | null;
  splitWeekPlan: SplitWeekPlan;
  onSelectDay: (day: number) => void;
  onSetWeekDaySlot: (day: number, slot: WeekDaySlot) => void;
};

export { getInitialWorkoutDay };

export function SplitWeekPlanner({
  selectedDay,
  todayDay,
  diaOffManual = false,
  treinoHojeId = null,
  splitWeekPlan,
  onSelectDay,
  onSetWeekDaySlot,
}: SplitWeekPlannerProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const isTodayOff = diaOffManual;
  const treinoDayCount = countWeekPlanTreinoDays(splitWeekPlan);
  const cardioDayCount = WEEK_DAY_ORDER.filter(
    (day) => getWeekDaySlot(day, splitWeekPlan).kind === "cardio",
  ).length;
  const restDayCount = WEEK_DAY_ORDER.filter(
    (day) => getWeekDaySlot(day, splitWeekPlan).kind === "rest",
  ).length;

  const selectedTreino = resolveTreinoForDay(selectedDay, {
    todayDay,
    treinoHojeId,
    splitWeekPlan,
  });
  const selectedSlot = getWeekDaySlot(selectedDay, splitWeekPlan);
  const showBackToToday = selectedDay !== todayDay;

  const handleSelectDay = (day: number) => {
    animateWithHaptic(() => {
      onSelectDay(day);
      setEditingDay(null);
    });
  };

  const handleBackToToday = () => {
    animateWithHaptic(() => {
      onSelectDay(todayDay);
      setEditingDay(null);
    });
  };

  const handleToggleEdit = (day: number) => {
    animateWithHaptic(() => {
      setEditingDay((current) => (current === day ? null : day));
      onSelectDay(day);
    });
  };

  const handleAssignSlot = (day: number, slot: WeekDaySlot) => {
    animateWithHaptic(() => {
      onSetWeekDaySlot(day, slot);
      setEditingDay(null);
    });
  };

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: withAlpha(theme.colors.surface.container, 0.65),
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 14,
        gap: 12,
        marginBottom: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              ...theme.typography.labelSmall,
              color: theme.colors.onSurface.variant,
            }}
          >
            PLANO DA SEMANA
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: theme.colors.onSurface.DEFAULT,
            }}
            numberOfLines={2}
          >
            {selectedTreino
              ? `Treino ${selectedTreino.letra} · ${selectedTreino.grupoMuscular}`
              : selectedSlot.kind === "cardio"
                ? "Cardio"
                : selectedSlot.kind === "rest"
                  ? "Descanso"
                  : isTodayOff
                    ? "Dia off hoje"
                    : "Sem treino"}
          </Text>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            {treinoDayCount} treinos · {cardioDayCount} cardio · {restDayCount}{" "}
            descanso
          </Text>
        </View>

        {showBackToToday ? (
          <Pressable
            onPress={handleBackToToday}
            accessibilityRole="button"
            accessibilityLabel="Voltar para hoje"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: theme.radius.lg,
              backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.12),
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.28),
              minHeight: 44,
              justifyContent: "center",
            })}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: theme.colors.primary.DEFAULT,
                letterSpacing: 0.5,
              }}
            >
              Hoje
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        {WEEK_DAY_ORDER.map((day) => {
          const slot = getWeekDaySlot(day, splitWeekPlan);
          const treino =
            day === todayDay
              ? resolveTreinoForDay(day, {
                  todayDay,
                  treinoHojeId,
                  splitWeekPlan,
                })
              : resolveTreinoForDay(day, { splitWeekPlan });
          const isSelected = day === selectedDay;
          const isToday = day === todayDay;
          const isEditing = editingDay === day;
          const isSwappedToday =
            isToday &&
            isTreinoSwappedToday(todayDay, treinoHojeId, splitWeekPlan);
          const isTodayChipOff = isToday && isTodayOff;

          const slotColor =
            slot.kind === "treino"
              ? theme.colors.primary.DEFAULT
              : slot.kind === "cardio"
                ? theme.colors.tertiary
                : theme.colors.onSurface.variant;

          return (
            <View key={day} style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => handleSelectDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`${DAY_NAMES_SHORT[day]}, ${formatWeekDaySlotShort(slot)}`}
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => ({
                    flex: 1,
                    opacity: pressed ? 0.85 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    minHeight: 48,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: theme.radius.lg,
                    backgroundColor: isSelected
                      ? withAlpha(theme.colors.primary.DEFAULT, 0.12)
                      : theme.colors.surface.containerHigh,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected
                      ? withAlpha(theme.colors.primary.DEFAULT, 0.45)
                      : isToday
                        ? withAlpha(theme.colors.tertiary, 0.25)
                        : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                  })}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: withAlpha(slotColor, 0.14),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: slot.kind === "treino" ? 13 : 11,
                        fontWeight: "900",
                        color: slotColor,
                      }}
                    >
                      {getWeekDaySlotLetter(slot)}
                    </Text>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "800",
                          color: isSelected
                            ? theme.colors.onSurface.DEFAULT
                            : theme.colors.onSurface.variant,
                        }}
                      >
                        {DAY_NAMES_SHORT[day]}
                      </Text>
                      {isToday ? (
                        <View
                          style={{
                            paddingHorizontal: 5,
                            paddingVertical: 1,
                            borderRadius: 4,
                            backgroundColor: isTodayChipOff
                              ? withAlpha(theme.colors.semantic.error, 0.15)
                              : isSwappedToday
                                ? withAlpha(theme.colors.primary.container, 0.18)
                                : withAlpha(theme.colors.tertiary, 0.15),
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 8,
                              fontWeight: "900",
                              color: isTodayChipOff
                                ? theme.colors.semantic.error
                                : isSwappedToday
                                  ? theme.colors.primary.DEFAULT
                                  : theme.colors.tertiary,
                            }}
                          >
                            {isTodayChipOff
                              ? "OFF"
                              : isSwappedToday
                                ? "TROCA"
                                : "HOJE"}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: theme.colors.onSurface.DEFAULT,
                      }}
                    >
                      {treino
                        ? `${treino.letra} · ${treino.grupoMuscular}`
                        : formatWeekDaySlotShort(slot)}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleEdit(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`Alterar treino de ${DAY_NAMES_SHORT[day]}`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.lg,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isEditing
                      ? withAlpha(theme.colors.primary.DEFAULT, 0.14)
                      : withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
                    borderWidth: 1,
                    borderColor: isEditing
                      ? withAlpha(theme.colors.primary.DEFAULT, 0.35)
                      : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                  })}
                >
                  <AppIcon
                    sf={isEditing ? "checkmark" : "arrow.triangle.2.circlepath"}
                    mci={isEditing ? "check" : "swap-horizontal"}
                    size={18}
                    color={
                      isEditing
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.onSurface.variant
                    }
                  />
                </Pressable>
              </View>

              {isEditing ? (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                    paddingLeft: 4,
                    paddingBottom: 4,
                  }}
                >
                  {SPLIT_ASSIGNMENT_OPTIONS.map((option) => {
                    const isActive = areWeekDaySlotsEqual(option, slot);
                    return (
                      <Pressable
                        key={
                          option.kind === "treino"
                            ? option.treinoId
                            : option.kind
                        }
                        onPress={() => handleAssignSlot(day, option)}
                        accessibilityRole="button"
                        accessibilityLabel={formatWeekDaySlotShort(option)}
                        accessibilityState={{ selected: isActive }}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.85 : 1,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderRadius: theme.radius.md,
                          backgroundColor: isActive
                            ? withAlpha(theme.colors.primary.DEFAULT, 0.16)
                            : theme.colors.surface.containerHighest,
                          borderWidth: 1,
                          borderColor: isActive
                            ? withAlpha(theme.colors.primary.DEFAULT, 0.4)
                            : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: isActive
                              ? theme.colors.primary.DEFAULT
                              : theme.colors.onSurface.DEFAULT,
                          }}
                        >
                          {formatWeekDaySlotShort(option)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {selectedDay !== todayDay ? (
        <Text
          style={{
            fontSize: 11,
            color: theme.colors.onSurface.variant,
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          Prévia do dia selecionado
        </Text>
      ) : (
        <Text
          style={{
            fontSize: 11,
            color: withAlpha(theme.colors.onSurface.variant, 0.75),
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          Toque no ícone para trocar o treino de qualquer dia
        </Text>
      )}
    </View>
  );
}
