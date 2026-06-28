import { Pressable, Text, View } from 'react-native'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import { SetLoggerCard } from '@/components/training/SetLoggerCard'
import { animateWithHaptic } from '@/utils/animationUtils'
import type { CurrentSetContext } from '@/utils/trainingPerformanceUtils'
import { SET_TYPE_LABELS } from '@/utils/trainingPerformanceUtils'

type CurrentSetCardProps = {
  currentSet: CurrentSetContext | null
  previousPerformance: string | null
  suggestedLoadKg: number | null
  hasSession: boolean
  workoutLabel: string
  showPrimaryAction: boolean
  onStartSession: () => void
  onCompleteSet: (data: {
    loadKg: number
    repsCompleted: number
    isFailure: boolean
  }) => void
  onUndoSet?: () => void
}

export function CurrentSetCard({
  currentSet,
  previousPerformance,
  suggestedLoadKg,
  hasSession,
  workoutLabel,
  showPrimaryAction,
  onStartSession,
  onCompleteSet,
  onUndoSet,
}: CurrentSetCardProps) {
  const handleStart = () => {
    animateWithHaptic(onStartSession)
  }

  if (!hasSession) {
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <AppIcon
            sf="figure.strengthtraining.traditional"
            mci="dumbbell"
            size={18}
            color={theme.colors.primary.DEFAULT}
          />
          <Text
            style={{
              ...theme.typography.labelMedium,
              color: theme.colors.primary.DEFAULT,
            }}
          >
            Training Session
          </Text>
        </View>

        <Text
          style={{
            ...theme.typography.headline,
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          {workoutLabel}
        </Text>

        {showPrimaryAction && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar treino"
            onPress={handleStart}
            style={({ pressed }) => ({
              backgroundColor: theme.colors.primary.container,
              borderRadius: theme.radius.lg,
              minHeight: 52,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={{
                ...theme.typography.body,
                fontWeight: '700',
                color: theme.colors.background,
              }}
            >
              Iniciar treino
            </Text>
          </Pressable>
        )}
      </View>
    )
  }

  if (!currentSet) return null

  if (currentSet.status === 'complete') {
    return (
      <View
        style={{
          backgroundColor: withAlpha(theme.colors.semantic.success, 0.08),
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.semantic.success, 0.25),
          padding: 20,
          marginBottom: 20,
          gap: 8,
        }}
      >
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.semantic.success,
          }}
        >
          Todos os sets concluídos
        </Text>
        <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
          {currentSet.exerciseName}
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.container, 0.2),
        padding: 20,
        marginBottom: 20,
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
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
          Set atual
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text
          style={{
            ...theme.typography.headline,
            fontSize: 22,
          }}
          numberOfLines={2}
        >
          {currentSet.exerciseName}
        </Text>
        <Text
          style={{
            ...theme.typography.footnote,
            color: theme.colors.onSurface.variant,
          }}
        >
          Set {currentSet.set.setNumber} de {currentSet.totalSetsInExercise} ·{' '}
          {SET_TYPE_LABELS[currentSet.set.plannedSetType]}
        </Text>
        <Text
          style={{
            ...theme.typography.caption,
            color: withAlpha(theme.colors.onSurface.variant, 0.75),
          }}
        >
          Exercício {currentSet.exerciseIndex + 1} de {currentSet.totalExercises}
        </Text>
      </View>

      {previousPerformance && (
        <View
          style={{
            backgroundColor: theme.colors.surface.containerHigh,
            borderRadius: theme.radius.lg,
            padding: 14,
            gap: 4,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          }}
        >
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Última sessão
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
            {previousPerformance}
          </Text>
          {suggestedLoadKg != null && (
            <Text
              style={{
                ...theme.typography.footnote,
                color: theme.colors.primary.DEFAULT,
                fontWeight: '600',
              }}
            >
              Sugestão: {suggestedLoadKg}kg
              {previousPerformance ? ` · Base: ${previousPerformance}` : ''}
            </Text>
          )}
        </View>
      )}

      <SetLoggerCard
        exerciseName={currentSet.exerciseName}
        set={currentSet.set}
        setIndex={currentSet.setIndex}
        totalSets={currentSet.totalSetsInExercise}
        suggestedLoadKg={suggestedLoadKg}
        onComplete={onCompleteSet}
        onUndo={onUndoSet}
      />
    </View>
  )
}
