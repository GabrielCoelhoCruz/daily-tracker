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
  getPreviousExerciseLog,
  getSessionVolume,
  getCompletedSetCount,
  getTotalSetCount,
  migrateLegacyExerciseLog,
  normalizeGymSession,
  SET_TYPE_LABELS,
} from '@/utils/trainingPerformanceUtils'

type SessionSummaryCardProps = {
  session: GymSession
  exercicios: Exercicio[]
  gymSessions: GymSession[]
  onFinish: () => void
}

function findBestSetInSession(
  session: GymSession,
  exercicios: Exercicio[],
): { exerciseName: string; loadKg: number; repsCompleted: number } | null {
  let best: {
    exerciseName: string
    loadKg: number
    repsCompleted: number
    volume: number
  } | null = null

  for (const log of session.logs) {
    const exercicio = exercicios.find((ex) => ex.id === log.exercicioId)
    const normalized = migrateLegacyExerciseLog(log, exercicio)
    const set = getExerciseBestSet(normalized)
    if (!set) continue
    if (!best || set.volume > best.volume) {
      best = {
        exerciseName: normalized.nome,
        loadKg: set.loadKg,
        repsCompleted: set.repsCompleted,
        volume: set.volume,
      }
    }
  }

  return best
    ? {
        exerciseName: best.exerciseName,
        loadKg: best.loadKg,
        repsCompleted: best.repsCompleted,
      }
    : null
}

function getPreviousSessionVolume(
  session: GymSession,
  gymSessions: GymSession[],
  exercicios: Exercicio[],
): number {
  const prior = gymSessions
    .filter(
      (entry) =>
        entry.treinoId === session.treinoId && entry.date < session.date,
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!prior) return 0
  return getSessionVolume(normalizeGymSession(prior, exercicios))
}

export function SessionSummaryCard({
  session,
  exercicios,
  gymSessions,
  onFinish,
}: SessionSummaryCardProps) {
  const normalized = normalizeGymSession(session, exercicios)
  const volume = getSessionVolume(normalized)
  const completedSets = getCompletedSetCount(normalized)
  const totalSets = getTotalSetCount(normalized)
  const bestSet = findBestSetInSession(normalized, exercicios)
  const previousVolume = getPreviousSessionVolume(
    normalized,
    gymSessions,
    exercicios,
  )
  const volumeDeltaPercent =
    previousVolume > 0
      ? Math.round(((volume - previousVolume) / previousVolume) * 1000) / 10
      : null

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.semantic.success, 0.25),
        padding: 20,
        marginBottom: 20,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppIcon
          sf="checkmark.seal.fill"
          mci="check-decagram"
          size={18}
          color={theme.colors.semantic.success}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.semantic.success,
          }}
        >
          Sessão concluída
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <View>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Volume total
          </Text>
          <Text style={{ ...theme.typography.headline, fontSize: 28 }}>
            {formatVolumeKg(volume)}
          </Text>
        </View>

        <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
          Sets concluídos: {completedSets}/{totalSets}
        </Text>

        {bestSet && (
          <Text style={{ ...theme.typography.footnote }}>
            Melhor set: {bestSet.exerciseName} — {bestSet.loadKg}kg x{' '}
            {bestSet.repsCompleted}
          </Text>
        )}

        {volumeDeltaPercent != null && (
          <Text
            style={{
              ...theme.typography.footnote,
              color:
                volumeDeltaPercent >= 0
                  ? theme.colors.semantic.success
                  : theme.colors.onSurface.variant,
            }}
          >
            {volumeDeltaPercent >= 0 ? '+' : ''}
            {volumeDeltaPercent}% volume vs última sessão
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Finalizar treino"
        onPress={onFinish}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.primary.container,
          borderRadius: theme.radius.lg,
          minHeight: 48,
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
          Finalizar treino
        </Text>
      </Pressable>
    </View>
  )
}
