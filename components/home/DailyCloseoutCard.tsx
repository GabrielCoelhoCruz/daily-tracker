import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { theme, withAlpha } from '@/constants/theme'
import { AppIcon } from '@/components/ui/AppIcon'
import { DailyLeakList } from '@/components/home/DailyLeakList'
import type { DailyCloseoutSummary } from '@/utils/dailyCloseoutUtils'

type DailyCloseoutCardProps = {
  summary: DailyCloseoutSummary
  isAlreadyClosed: boolean
  savedNote?: string
  onCloseDay: (dayNote: string) => void
  onGoExecute: () => void
}

function CloseoutNoteInput({
  initialNote,
  disabled,
  onSaveNote,
}: {
  initialNote: string
  disabled: boolean
  onSaveNote: (note: string) => void
}) {
  const [note, setNote] = useState(initialNote)

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          ...theme.typography.caption,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: theme.colors.onSurface.variant,
        }}
      >
        Nota do dia
      </Text>
      <TextInput
        accessibilityLabel="Nota do dia para o fechamento"
        editable={!disabled}
        multiline
        value={note}
        onChangeText={setNote}
        onBlur={() => onSaveNote(note)}
        onSubmitEditing={() => onSaveNote(note)}
        placeholder="Observações de execução, energia, aderência..."
        placeholderTextColor={theme.colors.onSurface.variant}
        style={{
          minHeight: 72,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface.container,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: theme.colors.onSurface.DEFAULT,
          ...theme.typography.body,
          textAlignVertical: 'top',
        }}
      />
    </View>
  )
}

export function DailyCloseoutCard({
  summary,
  isAlreadyClosed,
  savedNote = '',
  onCloseDay,
  onGoExecute,
}: DailyCloseoutCardProps) {
  const [noteDraft, setNoteDraft] = useState(savedNote)
  const accent = summary.isReadyToClose
    ? theme.colors.semantic.success
    : theme.colors.semantic.error

  const handleCloseDay = async () => {
    if (summary.isReadyToClose) {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      )
    } else {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      )
    }
    onCloseDay(noteDraft)
  }

  if (isAlreadyClosed) {
    return (
      <View
        style={{
          borderRadius: theme.radius['2xl'],
          backgroundColor: withAlpha(theme.colors.semantic.success, 0.08),
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.semantic.success, 0.25),
          padding: 20,
          gap: 10,
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
            Fechamento salvo
          </Text>
        </View>
        <Text style={{ ...theme.typography.body, fontWeight: '700' }}>
          Execução {summary.executionScore}%
        </Text>
        {summary.evidence ? (
          <Text style={{ ...theme.typography.footnote }}>{summary.evidence}</Text>
        ) : null}
        {savedNote ? (
          <Text
            style={{
              ...theme.typography.footnote,
              color: theme.colors.onSurface.variant,
            }}
          >
            Nota: {savedNote}
          </Text>
        ) : null}
      </View>
    )
  }

  return (
    <View
      style={{
        borderRadius: theme.radius['2xl'],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(accent, 0.2),
        padding: 20,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AppIcon
          sf="calendar.badge.checkmark"
          mci="calendar-check"
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
          Fechamento do dia
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.onSurface.variant,
          }}
        >
          Execução de hoje
        </Text>
        <Text style={{ ...theme.typography.headline, fontSize: 32 }}>
          {summary.executionScore}%
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ ...theme.typography.title3, fontSize: 18 }}>
          {summary.title}
        </Text>
        <Text style={{ ...theme.typography.footnote }}>{summary.subtitle}</Text>
      </View>

      {summary.evidence ? (
        <View
          style={{
            backgroundColor: theme.colors.surface.container,
            borderRadius: theme.radius.lg,
            padding: 12,
            gap: 4,
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
          }}
        >
          <Text
            style={{
              ...theme.typography.caption,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: theme.colors.onSurface.variant,
            }}
          >
            Evidência
          </Text>
          <Text style={{ ...theme.typography.body, fontWeight: '600' }}>
            {summary.evidence}
          </Text>
        </View>
      ) : null}

      <DailyLeakList leaks={summary.leaks} />

      <CloseoutNoteInput
        initialNote={savedNote}
        disabled={false}
        onSaveNote={setNoteDraft}
      />

      <View style={{ gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={summary.primaryActionLabel}
          onPress={handleCloseDay}
          style={({ pressed }) => ({
            minHeight: 48,
            borderRadius: theme.radius.lg,
            backgroundColor: accent,
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
            {summary.primaryActionLabel}
          </Text>
        </Pressable>

        {!summary.isReadyToClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar para executar pendências"
            onPress={onGoExecute}
            style={({ pressed }) => ({
              minHeight: 44,
              borderRadius: theme.radius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={{
                ...theme.typography.callout,
                color: theme.colors.primary.DEFAULT,
                fontWeight: '600',
              }}
            >
              Voltar para executar
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
