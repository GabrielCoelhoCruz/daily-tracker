import { Text, View } from 'react-native'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import type { DailyLeak } from '@/utils/dailyCloseoutUtils'

type DailyLeakListProps = {
  leaks: DailyLeak[]
}

function getSeverityColor(severity: DailyLeak['severity']): string {
  switch (severity) {
    case 'high':
      return theme.colors.semantic.error
    case 'medium':
      return theme.colors.primary.container
    default:
      return theme.colors.onSurface.variant
  }
}

export function DailyLeakList({ leaks }: DailyLeakListProps) {
  if (leaks.length === 0) return null

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          ...theme.typography.overline,
        }}
      >
        Pendências
      </Text>

      {leaks.map((leak) => (
        <View
          key={`${leak.type}-${leak.title}`}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface.container,
            borderWidth: 1,
            borderColor: withAlpha(getSeverityColor(leak.severity), 0.2),
          }}
        >
          <AppIcon
            sf="exclamationmark.triangle.fill"
            mci="alert-circle-outline"
            size={16}
            color={getSeverityColor(leak.severity)}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
              {leak.title}
            </Text>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.onSurface.variant,
              }}
            >
              {leak.evidence}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
