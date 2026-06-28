import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { theme, withAlpha } from '@/constants/theme'
import type { TrainingSetLog } from '@/stores/slices/gymLogSlice'
import { SET_TYPE_LABELS } from '@/utils/trainingPerformanceUtils'

type SetLoggerCardProps = {
  exerciseName: string
  set: TrainingSetLog
  setIndex: number
  totalSets: number
  onComplete: (data: {
    loadKg: number
    repsCompleted: number
    isFailure: boolean
  }) => void
  onUndo?: () => void
  suggestedLoadKg?: number | null
}

function parseNumericInput(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function StepperButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled ?? false }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface.containerHighest,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ ...theme.typography.body, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  )
}

export function SetLoggerCard({
  exerciseName,
  set,
  setIndex,
  totalSets,
  onComplete,
  onUndo,
  suggestedLoadKg,
}: SetLoggerCardProps) {
  const [loadText, setLoadText] = useState(
    set.loadKg != null ? String(set.loadKg) : suggestedLoadKg != null ? String(suggestedLoadKg) : '',
  )
  const [repsText, setRepsText] = useState(
    set.repsCompleted != null
      ? String(set.repsCompleted)
      : typeof set.plannedReps === 'number'
        ? String(set.plannedReps)
        : '',
  )
  const [isFailure, setIsFailure] = useState(set.isFailure)

  useEffect(() => {
    setLoadText(
      set.loadKg != null
        ? String(set.loadKg)
        : suggestedLoadKg != null
          ? String(suggestedLoadKg)
          : '',
    )
    setRepsText(
      set.repsCompleted != null
        ? String(set.repsCompleted)
        : typeof set.plannedReps === 'number'
          ? String(set.plannedReps)
          : '',
    )
    setIsFailure(set.isFailure)
  }, [set, suggestedLoadKg])

  const loadKg = parseNumericInput(loadText)
  const repsCompleted = parseNumericInput(repsText)
  const canComplete =
    loadKg != null && loadKg > 0 && repsCompleted != null && repsCompleted > 0

  const handleAdjustLoad = (delta: number) => {
    const current = loadKg ?? suggestedLoadKg ?? 0
    const next = Math.max(0, Math.round((current + delta) * 10) / 10)
    setLoadText(String(next))
  }

  const handleAdjustReps = (delta: number) => {
    const current = repsCompleted ?? (typeof set.plannedReps === 'number' ? set.plannedReps : 0)
    const next = Math.max(0, current + delta)
    setRepsText(String(next))
  }

  const handleComplete = async () => {
    if (!canComplete || loadKg == null || repsCompleted == null) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onComplete({ loadKg, repsCompleted, isFailure })
  }

  if (set.isCompleted) {
    return (
      <View
        style={{
          backgroundColor: withAlpha(theme.colors.semantic.success, 0.08),
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.semantic.success, 0.25),
          padding: 16,
          gap: 8,
        }}
      >
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.semantic.success,
          }}
        >
          Set {set.setNumber} concluído
        </Text>
        <Text style={{ ...theme.typography.body, fontWeight: '700' }}>
          {set.loadKg}kg x {set.repsCompleted}
          {set.isFailure ? ' · Falha' : ''}
        </Text>
        {onUndo && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Desfazer set ${set.setNumber} de ${exerciseName}`}
            onPress={onUndo}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              paddingVertical: 6,
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
              Desfazer set
            </Text>
          </Pressable>
        )}
      </View>
    )
  }

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ ...theme.typography.caption, color: theme.colors.onSurface.variant }}>
            Carga
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StepperButton label="−" onPress={() => handleAdjustLoad(-2.5)} />
            <TextInput
              accessibilityLabel={`Carga em kg para set ${set.setNumber} de ${exerciseName}`}
              keyboardType="numeric"
              value={loadText}
              onChangeText={setLoadText}
              placeholder="kg"
              placeholderTextColor={theme.colors.onSurface.variant}
              style={{
                flex: 1,
                minHeight: 52,
                backgroundColor: theme.colors.surface.containerHigh,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
                paddingHorizontal: 14,
                color: theme.colors.onSurface.DEFAULT,
                ...theme.typography.headline,
                fontSize: 24,
                textAlign: 'center',
              }}
            />
            <StepperButton label="+" onPress={() => handleAdjustLoad(2.5)} />
          </View>
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ ...theme.typography.caption, color: theme.colors.onSurface.variant }}>
            Reps
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StepperButton label="−" onPress={() => handleAdjustReps(-1)} />
            <TextInput
              accessibilityLabel={`Repetições realizadas no set ${set.setNumber} de ${exerciseName}`}
              keyboardType="numeric"
              value={repsText}
              onChangeText={setRepsText}
              placeholder="reps"
              placeholderTextColor={theme.colors.onSurface.variant}
              style={{
                flex: 1,
                minHeight: 52,
                backgroundColor: theme.colors.surface.containerHigh,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
                paddingHorizontal: 14,
                color: theme.colors.onSurface.DEFAULT,
                ...theme.typography.headline,
                fontSize: 24,
                textAlign: 'center',
              }}
            />
            <StepperButton label="+" onPress={() => handleAdjustReps(1)} />
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Marcar falha no set ${set.setNumber}`}
        accessibilityState={{ selected: isFailure }}
        onPress={() => setIsFailure((current) => !current)}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: isFailure
            ? theme.colors.semantic.error
            : withAlpha(theme.colors.onSurface.DEFAULT, 0.12),
          backgroundColor: isFailure
            ? withAlpha(theme.colors.semantic.error, 0.12)
            : 'transparent',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: '700',
            color: isFailure
              ? theme.colors.semantic.error
              : theme.colors.onSurface.variant,
          }}
        >
          Falha
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Completar set ${set.setNumber} de ${exerciseName}`}
        accessibilityState={{ disabled: !canComplete }}
        disabled={!canComplete}
        onPress={handleComplete}
        style={({ pressed }) => ({
          backgroundColor: canComplete
            ? theme.colors.primary.container
            : withAlpha(theme.colors.onSurface.variant, 0.2),
          borderRadius: theme.radius.lg,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed && canComplete ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            ...theme.typography.body,
            fontWeight: '700',
            color: canComplete
              ? theme.colors.background
              : theme.colors.onSurface.variant,
          }}
        >
          Completar set
        </Text>
      </Pressable>

      <Text
        style={{
          ...theme.typography.caption,
          color: withAlpha(theme.colors.onSurface.variant, 0.75),
          textAlign: 'center',
        }}
      >
        Set {setIndex + 1} de {totalSets} · {SET_TYPE_LABELS[set.plannedSetType]}
      </Text>
    </View>
  )
}
