import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import type { DailyProtocolSummary } from '@/utils/dailyProtocolSummaryUtils'

type DailyProtocolSummaryCardProps = {
  summary: DailyProtocolSummary
}

function getStatusAccent(status: DailyProtocolSummary['status']): string {
  switch (status) {
    case 'complete':
      return theme.colors.semantic.success
    case 'leak':
      return theme.colors.semantic.error
    case 'day-off':
      return theme.colors.onSurface.variant
    default:
      return theme.colors.primary.DEFAULT
  }
}

export function DailyProtocolSummaryCard({
  summary,
}: DailyProtocolSummaryCardProps) {
  const router = useRouter()
  const accent = getStatusAccent(summary.status)

  function handleOpenProtocol() {
    router.push('/(tabs)/(hoje)/protocol')
  }

  return (
    <View
      style={{
        borderRadius: theme.radius['2xl'],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.18),
        padding: 20,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AppIcon
          sf="list.bullet.clipboard.fill"
          mci="clipboard-list-outline"
          size={18}
          color={accent}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          Protocolo do Dia
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ ...theme.typography.title3, fontSize: 18 }}>
          {summary.title}
        </Text>
        {summary.evidenceLine ? (
          <Text style={{ ...theme.typography.footnote }}>
            {summary.evidenceLine}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Refeições
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
            {summary.mealsLabel}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Água
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
            {summary.waterLabel}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Cardio
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
            {summary.cardioLabel}
          </Text>
        </View>
      </View>

      {summary.nextPendingLabel && (
        <View style={{ gap: 4 }}>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
            }}
          >
            Próxima pendência
          </Text>
          <Text
            style={{
              ...theme.typography.body,
              fontWeight: '700',
              color: theme.colors.primary.DEFAULT,
            }}
          >
            {summary.nextPendingLabel}
          </Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver protocolo completo"
        onPress={handleOpenProtocol}
        style={({ pressed }) => ({
          minHeight: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: withAlpha(accent, 0.12),
          borderWidth: 1,
          borderColor: withAlpha(accent, 0.22),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            ...theme.typography.callout,
            fontWeight: '700',
            color: accent,
          }}
        >
          Ver protocolo
        </Text>
      </Pressable>
    </View>
  )
}
