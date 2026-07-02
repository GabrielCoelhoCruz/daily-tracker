import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { animateWithHaptic } from "@/utils/animationUtils";
import type { CurrentTrainingExercise } from "@/utils/trainingSessionUtils";

type CurrentLiftCardProps = {
  currentExercise: CurrentTrainingExercise;
  previousLoadKg: number | null;
  suggestedLoadKg: number | null;
  hasSession: boolean;
  showPrimaryAction: boolean;
  onPrimaryAction: () => void;
};

function formatLoad(kg: number): string {
  return Number.isInteger(kg) ? `${kg}kg` : `${kg}kg`;
}

export function CurrentLiftCard({
  currentExercise,
  previousLoadKg,
  suggestedLoadKg,
  hasSession,
  showPrimaryAction,
  onPrimaryAction,
}: CurrentLiftCardProps) {
  const handlePrimaryAction = () => {
    animateWithHaptic(onPrimaryAction);
  };

  const buttonLabel = hasSession ? "Registrar Série" : "Iniciar Sessão";
  const buttonAccessibilityLabel = hasSession
    ? `Registrar série de ${currentExercise.name}`
    : `Iniciar sessão de ${currentExercise.name}`;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.container, 0.2),
        padding: 20,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <AppIcon
          sf="scope"
          mci="crosshairs-gps"
          size={18}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          Exercício atual
        </Text>
      </View>

      <Text
        style={{
          ...theme.typography.headline,
          fontSize: 22,
          marginBottom: 6,
        }}
        numberOfLines={2}
      >
        {currentExercise.name}
      </Text>

      <Text
        style={{
          ...theme.typography.footnote,
          color: theme.colors.onSurface.variant,
          marginBottom: 4,
        }}
      >
        {currentExercise.setSummary}
      </Text>

      <Text
        style={{
          ...theme.typography.caption,
          color: withAlpha(theme.colors.onSurface.variant, 0.75),
          marginBottom: 16,
        }}
      >
        {currentExercise.index + 1} de {currentExercise.totalExercises} exercícios
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.surface.containerHigh,
          borderRadius: theme.radius.lg,
          padding: 14,
          gap: 6,
          marginBottom: showPrimaryAction ? 16 : 0,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        }}
      >
        {previousLoadKg != null ? (
          <>
            <Text style={{ ...theme.typography.body, fontWeight: "600" }}>
              Última: {formatLoad(previousLoadKg)}
            </Text>
            {suggestedLoadKg != null && (
              <Text
                style={{
                  ...theme.typography.footnote,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: "600",
                }}
              >
                Sugestão: {formatLoad(suggestedLoadKg)}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={{ ...theme.typography.body, fontWeight: "600" }}>
              Sem carga anterior
            </Text>
            <Text
              style={{
                ...theme.typography.footnote,
                color: theme.colors.onSurface.variant,
              }}
            >
              Registre a base de hoje
            </Text>
          </>
        )}
      </View>

      {showPrimaryAction && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={buttonAccessibilityLabel}
          onPress={handlePrimaryAction}
          style={({ pressed }) => ({
            backgroundColor: theme.colors.primary.container,
            borderRadius: theme.radius.lg,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              ...theme.typography.body,
              fontWeight: "700",
              color: theme.colors.background,
            }}
          >
            {buttonLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
