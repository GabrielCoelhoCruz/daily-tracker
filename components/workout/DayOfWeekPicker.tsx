import { Pressable, ScrollView, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { DAY_NAMES_SHORT, WORKOUT_DAY_INDICES } from "@/constants/days";
import { getTreinoDoDia } from "@/utils/diaUtils";
import { animateWithHaptic } from "@/utils/animationUtils";

type DayOfWeekPickerProps = {
  selectedDay: number;
  todayDay: number;
  diaOffManual?: boolean;
  onSelectDay: (day: number) => void;
};

function getDefaultWorkoutDay(todayDay: number): number {
  if (todayDay >= 1 && todayDay <= 5) return todayDay;
  if (todayDay === 0) return 1;
  return 5;
}

/** Sensible initial selection when opening Workout (handles weekends). */
export function getInitialWorkoutDay(todayDay: number): number {
  return getDefaultWorkoutDay(todayDay);
}

export function DayOfWeekPicker({
  selectedDay,
  todayDay,
  diaOffManual = false,
  onSelectDay,
}: DayOfWeekPickerProps) {
  const isTodayWorkoutDay = todayDay >= 1 && todayDay <= 5;
  const isTodayOff = isTodayWorkoutDay && diaOffManual;
  const showBackToToday =
    isTodayWorkoutDay && selectedDay !== todayDay;

  function handleSelect(day: number) {
    animateWithHaptic(() => onSelectDay(day));
  }

  function handleBackToToday() {
    animateWithHaptic(() => onSelectDay(todayDay));
  }

  const selectedTreino = getTreinoDoDia(selectedDay);

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: withAlpha(theme.colors.surface.container, 0.65),
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 14,
        gap: 14,
      }}
    >
      {/* Header */}
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
            SEMANA DO SPLIT
          </Text>
          {selectedTreino ? (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: theme.colors.onSurface.DEFAULT,
              }}
              numberOfLines={1}
            >
              Split {selectedTreino.letra}
              <Text style={{ color: theme.colors.onSurface.variant, fontWeight: "500" }}>
                {" "}
                · {selectedTreino.grupoMuscular}
              </Text>
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: theme.colors.onSurface.variant,
              }}
            >
              {isTodayOff ? "Hoje é dia off" : "Sem treino neste dia"}
            </Text>
          )}
        </View>

        {showBackToToday ? (
          <Pressable
            onPress={handleBackToToday}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o treino de hoje"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: theme.radius.lg,
              backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.12),
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.28),
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

      {/* Day chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {WORKOUT_DAY_INDICES.map((day) => {
          const treino = getTreinoDoDia(day);
          const isSelected = day === selectedDay;
          const isToday = day === todayDay;
          const isTodayChipOff = isToday && isTodayOff;

          return (
            <Pressable
              key={day}
              onPress={() => handleSelect(day)}
              accessibilityRole="button"
              accessibilityLabel={
                treino
                  ? `Split ${treino.letra}, ${treino.grupoMuscular}, ${DAY_NAMES_SHORT[day]}`
                  : DAY_NAMES_SHORT[day]
              }
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                style={{
                  width: 68,
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 6,
                  borderRadius: theme.radius.lg,
                  backgroundColor: isSelected
                    ? withAlpha(theme.colors.primary.DEFAULT, 0.16)
                    : theme.colors.surface.containerHigh,
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected
                    ? theme.colors.primary.DEFAULT
                    : isToday
                      ? withAlpha(theme.colors.tertiary, 0.45)
                      : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                }}
              >
                {/* Split letter */}
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected
                      ? withAlpha(theme.colors.primary.DEFAULT, 0.22)
                      : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "900",
                      color: isSelected
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.onSurface.DEFAULT,
                    }}
                  >
                    {treino?.letra ?? "—"}
                  </Text>
                </View>

                {/* Weekday */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: isSelected
                      ? theme.colors.onSurface.DEFAULT
                      : theme.colors.onSurface.variant,
                  }}
                >
                  {DAY_NAMES_SHORT[day]}
                </Text>

                {/* Muscle group */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 9,
                    fontWeight: "600",
                    color: withAlpha(theme.colors.onSurface.variant, 0.85),
                    marginTop: 2,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {treino?.grupoMuscular ?? "—"}
                </Text>

                {/* Today / off indicator */}
                {isToday ? (
                  <View
                    style={{
                      marginTop: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      backgroundColor: isTodayChipOff
                        ? withAlpha(theme.colors.semantic.error, 0.15)
                        : withAlpha(theme.colors.tertiary, 0.15),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        fontWeight: "900",
                        letterSpacing: 0.6,
                        color: isTodayChipOff
                          ? theme.colors.semantic.error
                          : theme.colors.tertiary,
                      }}
                    >
                      {isTodayChipOff ? "OFF" : "HOJE"}
                    </Text>
                  </View>
                ) : (
                  <View style={{ height: 18, marginTop: 6 }} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedDay !== todayDay && selectedTreino ? (
        <Text
          style={{
            fontSize: 11,
            color: theme.colors.onSurface.variant,
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          Prévia do protocolo — não altera o treino de hoje
        </Text>
      ) : null}
    </View>
  );
}
