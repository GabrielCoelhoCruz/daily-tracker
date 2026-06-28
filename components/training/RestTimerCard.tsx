import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import type { TrainingSetType } from '@/stores/slices/gymLogSlice'
import { getRestSecondsForSetType } from '@/utils/trainingPerformanceUtils'

export type RestTimerState = 'inactive' | 'running' | 'completed' | 'skipped'

type RestTimerCardProps = {
  setType: TrainingSetType | null
  active: boolean
  onComplete?: () => void
}

export function RestTimerCard({ setType, active, onComplete }: RestTimerCardProps) {
  const [state, setState] = useState<RestTimerState>('inactive')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const totalSeconds = setType ? getRestSecondsForSetType(setType) : 90

  useEffect(() => {
    if (!active) {
      setState('inactive')
      setSecondsLeft(0)
      return
    }

    setState('running')
    setSecondsLeft(totalSeconds)
  }, [active, totalSeconds])

  useEffect(() => {
    if (state !== 'running' || secondsLeft <= 0) return

    const timer = setTimeout(() => {
      if (secondsLeft <= 1) {
        setState('completed')
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onComplete?.()
        return
      }
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [state, secondsLeft, onComplete])

  if (state === 'inactive') return null

  const handleSkip = () => {
    setState('skipped')
    onComplete?.()
  }

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.containerHigh,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.container, 0.25),
        padding: 16,
        marginBottom: 20,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppIcon
          sf="timer"
          mci="timer-outline"
          size={16}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          Descanso
        </Text>
      </View>

      {state === 'running' && (
        <>
          <Text
            style={{
              ...theme.typography.headline,
              fontSize: 32,
              textAlign: 'center',
            }}
          >
            {secondsLeft}s
          </Text>
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: theme.colors.primary.container,
              }}
            />
          </View>
        </>
      )}

      {state === 'completed' && (
        <Text
          style={{
            ...theme.typography.body,
            color: theme.colors.semantic.success,
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          Descanso concluído
        </Text>
      )}

      {state === 'skipped' && (
        <Text
          style={{
            ...theme.typography.footnote,
            color: theme.colors.onSurface.variant,
            textAlign: 'center',
          }}
        >
          Descanso pulado
        </Text>
      )}

      {state === 'running' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pular descanso"
          onPress={handleSkip}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: 10,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            style={{
              ...theme.typography.footnote,
              color: theme.colors.onSurface.variant,
              fontWeight: '600',
            }}
          >
            Pular
          </Text>
        </Pressable>
      )}
    </View>
  )
}
