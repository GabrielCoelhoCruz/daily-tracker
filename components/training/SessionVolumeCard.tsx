import { Text, View } from 'react-native'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import {
  formatVolumeKg,
  getCompletedSetCount,
  getSessionVolume,
  getTotalSetCount,
} from '@/utils/trainingPerformanceUtils'

type SessionVolumeCardProps = {
  session: GymSession | undefined
}

export function SessionVolumeCard({ session }: SessionVolumeCardProps) {
  if (!session) return null

  const volume = getSessionVolume(session)
  const completedSets = getCompletedSetCount(session)
  const totalSets = getTotalSetCount(session)

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.containerHigh,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        padding: 16,
        marginBottom: 20,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppIcon
          sf="chart.bar.fill"
          mci="chart-bar"
          size={16}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.onSurface.variant,
          }}
        >
          Execução do treino
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Volume registrado
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '700' }}>
            {formatVolumeKg(volume)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Sets concluídos
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '700' }}>
            {completedSets}/{totalSets}
          </Text>
        </View>
      </View>
    </View>
  )
}
