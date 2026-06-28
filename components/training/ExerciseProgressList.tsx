import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import type { Exercicio } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  formatVolumeKg,
  getExerciseBestSet,
  getExerciseCompletedSetCount,
  getExerciseVolume,
  migrateLegacyExerciseLog,
  SET_TYPE_LABELS,
} from '@/utils/trainingPerformanceUtils'
import { getCurrentSet } from '@/utils/trainingPerformanceUtils'

type ExerciseProgressListProps = {
  exercicios: Exercicio[]
  session: GymSession | undefined
}

function ExerciseSetTable({
  exercicio,
  session,
}: {
  exercicio: Exercicio
  session: GymSession
}) {
  const log = session.logs.find((entry) => entry.exercicioId === exercicio.id)
  if (!log) return null

  const normalized = migrateLegacyExerciseLog(log, exercicio)
  const sets = normalized.sets ?? []

  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      {sets.map((set) => (
        <View
          key={set.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: set.isCompleted
              ? withAlpha(theme.colors.semantic.success, 0.08)
              : theme.colors.surface.containerHigh,
            borderWidth: 1,
            borderColor: set.isCompleted
              ? withAlpha(theme.colors.semantic.success, 0.2)
              : withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ ...theme.typography.caption, fontWeight: '700' }}>
              Set {set.setNumber} · {SET_TYPE_LABELS[set.plannedSetType]}
            </Text>
            {set.plannedReps != null && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.onSurface.variant,
                }}
              >
                Alvo: {set.plannedReps}
              </Text>
            )}
          </View>
          <Text
            style={{
              ...theme.typography.body,
              fontWeight: set.isCompleted ? '700' : '500',
              color: set.isCompleted
                ? theme.colors.semantic.success
                : theme.colors.onSurface.variant,
            }}
          >
            {set.isCompleted && set.loadKg != null && set.repsCompleted != null
              ? `${set.loadKg}kg x ${set.repsCompleted}${set.isFailure ? ' · Falha' : ''}`
              : '—'}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function ExerciseProgressList({
  exercicios,
  session,
}: ExerciseProgressListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const currentSet = getCurrentSet(session, exercicios)

  if (!session) return null

  return (
    <View style={{ marginBottom: 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppIcon
          sf="list.bullet"
          mci="format-list-bulleted"
          size={16}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.onSurface.variant,
          }}
        >
          Exercícios
        </Text>
      </View>

      {exercicios.map((exercicio) => {
        const log = session.logs.find((entry) => entry.exercicioId === exercicio.id)
        const normalized = log
          ? migrateLegacyExerciseLog(log, exercicio)
          : null
        const completed = normalized
          ? getExerciseCompletedSetCount(normalized)
          : 0
        const total = normalized?.sets?.length ?? 0
        const best = normalized ? getExerciseBestSet(normalized) : null
        const volume = normalized ? getExerciseVolume(normalized) : 0
        const isCurrent = currentSet?.exercicioId === exercicio.id
        const isExpanded = expandedId === exercicio.id || isCurrent

        return (
          <View
            key={exercicio.id}
            style={{
              backgroundColor: theme.colors.surface.container,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: isCurrent
                ? withAlpha(theme.colors.primary.container, 0.35)
                : withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
              padding: 14,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver sets de ${exercicio.nome}`}
              accessibilityState={{ expanded: isExpanded }}
              onPress={() =>
                setExpandedId((current) =>
                  current === exercicio.id ? null : exercicio.id,
                )
              }
              style={{ gap: 6 }}
            >
              <Text
                style={{
                  ...theme.typography.body,
                  fontWeight: '700',
                }}
                numberOfLines={2}
              >
                {exercicio.nome}
              </Text>
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.onSurface.variant,
                }}
              >
                {total} sets · {completed} concluídos
              </Text>
              {best && (
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.colors.primary.DEFAULT,
                    fontWeight: '600',
                  }}
                >
                  Best: {best.loadKg}kg x {best.repsCompleted}
                </Text>
              )}
              {volume > 0 && (
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.colors.onSurface.variant,
                  }}
                >
                  Volume: {formatVolumeKg(volume)}
                </Text>
              )}
            </Pressable>

            {isExpanded && (
              <ExerciseSetTable exercicio={exercicio} session={session} />
            )}
          </View>
        )
      })}
    </View>
  )
}
