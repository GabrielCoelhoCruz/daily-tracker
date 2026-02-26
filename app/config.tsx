import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { useConfigStore } from "@/stores/useConfigStore";
import { plano } from "@/data/plano";

const INTERVALO_OPTIONS = [1, 2, 3] as const;

function SectionHeader({ children }: { children: string }) {
  return (
    <Text
      style={{
        ...theme.typography.footnote,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: theme.colors.text.secondary,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function SettingRow({
  label,
  subtitle,
  right,
  showDivider = true,
}: {
  label: string;
  subtitle?: string;
  right: React.ReactNode;
  showDivider?: boolean;
}) {
  return (
    <>
      <View
        className="flex-row items-center justify-between px-4"
        style={{ minHeight: 44 }}
      >
        <View className="flex-1 gap-0.5">
          <Text style={theme.typography.body}>{label}</Text>
          {subtitle && (
            <Text style={theme.typography.caption}>{subtitle}</Text>
          )}
        </View>
        {right}
      </View>
      {showDivider && (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.colors.border,
            marginLeft: 16,
          }}
        />
      )}
    </>
  );
}

function PeriodoNotificacao({
  periodoId,
  periodoNome,
  descricao,
  isLast,
}: {
  periodoId: string;
  periodoNome: string;
  descricao?: string;
  isLast: boolean;
}) {
  const config = useConfigStore(
    (s) => s.notificacoesPorPeriodo[periodoId]
  );
  const toggleNotificacao = useConfigStore((s) => s.toggleNotificacaoPeriodo);
  const setHorario = useConfigStore((s) => s.setHorarioPeriodo);

  const enabled = config?.enabled ?? false;
  const horario = config?.horario ?? "08:00";

  function handleHorarioChange(text: string) {
    const cleaned = text.replace(/[^0-9:]/g, "");

    if (cleaned.length === 2 && !cleaned.includes(":") && horario.length < cleaned.length) {
      const hh = parseInt(cleaned, 10);
      if (hh > 23) return;
      setHorario(periodoId, cleaned + ":");
      return;
    }

    if (cleaned.length === 5 && cleaned.includes(":")) {
      const [hh, mm] = cleaned.split(":").map(Number);
      if (hh > 23 || mm > 59) return;
    }

    if (cleaned.length <= 5) {
      setHorario(periodoId, cleaned);
    }
  }

  return (
    <SettingRow
      label={periodoNome}
      subtitle={descricao}
      showDivider={!isLast}
      right={
        <View className="flex-row items-center gap-3">
          {enabled && (
            <TextInput
              value={horario}
              onChangeText={handleHorarioChange}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="number-pad"
              maxLength={5}
              style={{
                width: 72,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: theme.radius.md,
                borderCurve: "continuous",
                backgroundColor: theme.colors.bg.elevated,
                color: theme.colors.text.primary,
                ...theme.typography.body,
                textAlign: "center",
                fontVariant: ["tabular-nums"],
              }}
            />
          )}
          <Switch
            value={enabled}
            onValueChange={() => toggleNotificacao(periodoId)}
            trackColor={{
              false: theme.colors.bg.elevated,
              true: theme.colors.accent.DEFAULT,
            }}
            thumbColor={theme.colors.text.primary}
          />
        </View>
      }
    />
  );
}

export default function ConfigScreen() {
  const hidratacaoLembrete = useConfigStore((s) => s.hidratacaoLembrete);
  const toggleHidratacao = useConfigStore((s) => s.toggleHidratacaoLembrete);
  const setIntervalo = useConfigStore((s) => s.setIntervaloHidratacao);

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-12"
    >
      {/* Period Notifications */}
      <SectionHeader>NOTIFICAÇÕES POR PERÍODO</SectionHeader>
      <Card className="p-0">
        {plano.periodos.map((periodo, index) => (
          <PeriodoNotificacao
            key={periodo.id}
            periodoId={periodo.id}
            periodoNome={periodo.nome}
            descricao={periodo.descricao}
            isLast={index === plano.periodos.length - 1}
          />
        ))}
      </Card>

      {/* Hydration Reminders */}
      <SectionHeader>HIDRATAÇÃO</SectionHeader>
      <Card className="p-0">
        <SettingRow
          label="Lembretes periódicos"
          subtitle="Notificações entre 7h e 22h"
          showDivider={hidratacaoLembrete.enabled}
          right={
            <Switch
              value={hidratacaoLembrete.enabled}
              onValueChange={toggleHidratacao}
              trackColor={{
                false: theme.colors.bg.elevated,
                true: theme.colors.accent.DEFAULT,
              }}
              thumbColor={theme.colors.text.primary}
            />
          }
        />

        {hidratacaoLembrete.enabled && (
          <View className="px-4 pb-4 pt-3" style={{ gap: 10 }}>
            <Text style={theme.typography.footnote}>
              Intervalo entre lembretes
            </Text>
            <View
              className="flex-row"
              style={{
                borderRadius: theme.radius.md,
                borderCurve: "continuous",
                overflow: "hidden",
              }}
            >
              {INTERVALO_OPTIONS.map((horas, index) => {
                const isActive = hidratacaoLembrete.intervaloHoras === horas;
                return (
                  <Pressable
                    key={horas}
                    onPress={() => setIntervalo(horas)}
                    accessibilityLabel={`Intervalo de ${horas} hora${horas > 1 ? "s" : ""}`}
                    accessibilityState={{ selected: isActive }}
                    className="flex-1 items-center justify-center"
                    style={{
                      paddingVertical: 8,
                      backgroundColor: isActive
                        ? theme.colors.accent.DEFAULT
                        : theme.colors.bg.elevated,
                      borderRightWidth: index < INTERVALO_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                      borderRightColor: theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        ...theme.typography.footnote,
                        fontWeight: "600",
                        color: isActive
                          ? theme.colors.bg.primary
                          : theme.colors.text.secondary,
                      }}
                    >
                      {horas}h
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
