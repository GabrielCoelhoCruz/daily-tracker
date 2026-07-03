import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Treino } from "@/data/treinos";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { animateWithHaptic } from "@/utils/animationUtils";
import { isTreinoSwappedToday } from "@/utils/diaUtils";
import type { SplitWeekPlan } from "@/utils/splitWeekUtils";
import { useActiveTreinos } from "@/stores/useProtocolStore";

type WorkoutSwapCardProps = {
  todayDay: number;
  scheduledTreino: Treino;
  activeTreino: Treino;
  treinoHojeId: string | null;
  splitWeekPlan: SplitWeekPlan;
  onSelectTreino: (treinoId: string | null) => void;
};

export function WorkoutSwapCard({
  todayDay,
  scheduledTreino,
  activeTreino,
  treinoHojeId,
  splitWeekPlan,
  onSelectTreino,
}: WorkoutSwapCardProps) {
  const [expanded, setExpanded] = useState(false);
  const treinos = useActiveTreinos();
  const isSwapped = isTreinoSwappedToday(todayDay, treinoHojeId, splitWeekPlan);

  const handleToggleExpanded = () => {
    animateWithHaptic(() => setExpanded((value) => !value));
  };

  const handleSelectTreino = (treinoId: string) => {
    animateWithHaptic(() => {
      if (treinoId === scheduledTreino.id) {
        onSelectTreino(null);
      } else {
        onSelectTreino(treinoId);
      }
      setExpanded(false);
    });
  };

  const handleResetToScheduled = () => {
    animateWithHaptic(() => {
      onSelectTreino(null);
      setExpanded(false);
    });
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: isSwapped
          ? withAlpha(theme.colors.primary.container, 0.35)
          : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 14,
        marginBottom: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <AppIcon
          sf="arrow.triangle.swap"
          mci="swap-horizontal"
          size={18}
          color={isSwapped ? theme.colors.primary.DEFAULT : theme.colors.onSurface.variant}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              ...theme.typography.labelMedium,
              color: theme.colors.onSurface.variant,
            }}
          >
            Treino de hoje
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: "700" }}>
            Treino {activeTreino.letra} · {activeTreino.grupoMuscular}
          </Text>
          {isSwapped ? (
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.primary.DEFAULT,
              }}
            >
              Agendado: Treino {scheduledTreino.letra} · {scheduledTreino.grupoMuscular}
            </Text>
          ) : (
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              Split do dia
            </Text>
          )}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Fechar opções de troca de treino" : "Alterar treino de hoje"
        }
        onPress={handleToggleExpanded}
        style={({ pressed }) => ({
          minHeight: 44,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.28),
          backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.1),
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            ...theme.typography.body,
            fontWeight: "700",
            color: theme.colors.primary.DEFAULT,
          }}
        >
          {expanded ? "Fechar" : "Trocar treino"}
        </Text>
      </Pressable>

      {expanded ? (
        <View style={{ gap: 8 }}>
          {treinos.map((treino) => {
            const isActive = activeTreino.id === treino.id;
            const isScheduled = scheduledTreino.id === treino.id;

            return (
              <Pressable
                key={treino.id}
                accessibilityRole="button"
                accessibilityLabel={`Treino ${treino.letra}, ${treino.grupoMuscular}`}
                accessibilityState={{ selected: isActive }}
                onPress={() => handleSelectTreino(treino.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 48,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: theme.radius.lg,
                  backgroundColor: isActive
                    ? withAlpha(theme.colors.primary.DEFAULT, 0.14)
                    : theme.colors.surface.containerHigh,
                  borderWidth: 1,
                  borderColor: isActive
                    ? withAlpha(theme.colors.primary.DEFAULT, 0.4)
                    : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ ...theme.typography.body, fontWeight: "700" }}>
                    Treino {treino.letra} · {treino.grupoMuscular}
                  </Text>
                  {isScheduled ? (
                    <Text
                      style={{
                        ...theme.typography.caption,
                        color: theme.colors.onSurface.variant,
                      }}
                    >
                      Split do dia
                    </Text>
                  ) : null}
                </View>
                {isActive ? (
                  <AppIcon
                    sf="checkmark.circle.fill"
                    mci="check-circle"
                    size={20}
                    color={theme.colors.primary.DEFAULT}
                  />
                ) : null}
              </Pressable>
            );
          })}

          {isSwapped ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar ao treino agendado do dia"
              onPress={handleResetToScheduled}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Text
                style={{
                  ...theme.typography.footnote,
                  color: theme.colors.onSurface.variant,
                  fontWeight: "600",
                }}
              >
                Usar split do dia
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
