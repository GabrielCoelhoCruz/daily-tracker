import { Text, TextInput, View, Pressable } from 'react-native'
import { useState, useEffect } from 'react'
import { theme, withAlpha } from '@/constants/theme'
import type { Treino } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import { useGymSessionForToday } from '@/hooks/useGymSession'

type GymLogPanelProps = {
  treino: Treino
  date: string
  visible: boolean
}

function GymExerciseLogRow({
  log,
  onUpdateCarga,
}: {
  log: GymSession['logs'][number]
  onUpdateCarga: (exercicioId: string, cargaKg: number) => void
}) {
  const [text, setText] = useState(
    log.cargaKg != null ? String(log.cargaKg) : '',
  )

  useEffect(() => {
    setText(log.cargaKg != null ? String(log.cargaKg) : '')
  }, [log.cargaKg])

  const handleBlur = () => {
    const trimmed = text.trim()
    if (trimmed === '') return
    const parsed = Number(trimmed.replace(',', '.'))
    if (!Number.isFinite(parsed)) return
    onUpdateCarga(log.exercicioId, parsed)
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.container,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
        padding: 14,
        gap: 8,
      }}
    >
      <Text
        style={{
          ...theme.typography.body,
          fontWeight: '600',
        }}
        numberOfLines={2}
      >
        {log.nome}
      </Text>
      <Text style={{ ...theme.typography.caption, color: theme.colors.onSurface.variant }}>
        {log.series} séries
        {log.repeticoes > 0 ? ` · ${log.repeticoes} reps` : ''}
      </Text>
      <TextInput
        accessibilityLabel={`Carga em kg para ${log.nome}`}
        keyboardType="numeric"
        placeholder="Carga (kg)"
        placeholderTextColor={theme.colors.onSurface.variant}
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        onSubmitEditing={handleBlur}
        style={{
          backgroundColor: theme.colors.surface.containerHigh,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: theme.colors.onSurface.DEFAULT,
          ...theme.typography.body,
        }}
      />
    </View>
  )
}

export function GymLogPanel({ treino, date, visible }: GymLogPanelProps) {
  const { session, startSession, updateCarga } = useGymSessionForToday(
    visible ? treino : null,
    date,
  )

  if (!visible) return null

  return (
    <View style={{ marginBottom: 24, gap: 12 }}>
      <View
        style={{
          backgroundColor: withAlpha(theme.colors.primary.container, 0.12),
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: withAlpha(theme.colors.primary.container, 0.25),
        }}
      >
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.primary.DEFAULT,
            fontWeight: '700',
            letterSpacing: 0.5,
          }}
        >
          Modo registro — hoje
        </Text>
      </View>

      {!session ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar treino"
          onPress={() => startSession()}
          style={({ pressed }) => ({
            backgroundColor: theme.colors.primary.container,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
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
            Registrar treino
          </Text>
        </Pressable>
      ) : (
        <View style={{ gap: 10 }}>
          {session.logs.map((log) => (
            <GymExerciseLogRow
              key={log.exercicioId}
              log={log}
              onUpdateCarga={updateCarga}
            />
          ))}
        </View>
      )}
    </View>
  )
}
