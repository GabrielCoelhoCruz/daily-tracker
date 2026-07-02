import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import { animateNext } from '@/utils/animationUtils'
import type { DailyLeak } from '@/utils/dailyCloseoutUtils'

type DailyLeakListProps = {
  leaks: DailyLeak[]
}

// Acima disso a lista colapsa: em dias ruins, uma parede de pendências no
// dashboard vira punição visual em vez de orientação.
const VISIBLE_LEAK_COUNT = 3

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
  const [expanded, setExpanded] = useState(false)

  if (leaks.length === 0) return null

  const hiddenCount = leaks.length - VISIBLE_LEAK_COUNT
  const visibleLeaks =
    expanded || hiddenCount <= 0 ? leaks : leaks.slice(0, VISIBLE_LEAK_COUNT)

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          ...theme.typography.overline,
        }}
      >
        Pendências
      </Text>

      {visibleLeaks.map((leak) => (
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

      {hiddenCount > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? 'Mostrar menos pendências'
              : `Mostrar mais ${hiddenCount} pendências`
          }
          testID="leak-list-toggle"
          onPress={() => {
            animateNext()
            setExpanded((prev) => !prev)
          }}
          style={{
            minHeight: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              ...theme.typography.footnote,
              color: theme.colors.onSurface.variant,
              fontWeight: '600',
            }}
          >
            {expanded
              ? 'Mostrar menos'
              : `+${hiddenCount} ${hiddenCount === 1 ? 'pendência' : 'pendências'}`}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
