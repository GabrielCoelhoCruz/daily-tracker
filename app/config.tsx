import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { useConfigStore } from "@/stores/useConfigStore";
import { plano } from "@/data/plano";

const INTERVALO_OPTIONS = [1, 2, 3] as const;

function PeriodoNotificacao({
  periodoId,
  periodoNome,
  descricao,
}: {
  periodoId: string;
  periodoNome: string;
  descricao?: string;
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

    // Validate complete HH:MM
    if (cleaned.length === 5 && cleaned.includes(":")) {
      const [hh, mm] = cleaned.split(":").map(Number);
      if (hh > 23 || mm > 59) return;
    }

    if (cleaned.length <= 5) {
      setHorario(periodoId, cleaned);
    }
  }

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-txt-primary">
          {periodoNome}
        </Text>
        {descricao && (
          <Text className="text-xs text-txt-muted">{descricao}</Text>
        )}
      </View>

      <View className="flex-row items-center gap-3">
        {enabled && (
          <TextInput
            value={horario}
            onChangeText={handleHorarioChange}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="number-pad"
            maxLength={5}
            className="rounded-lg bg-bg-elevated px-3 py-1.5 text-center text-sm text-txt-primary"
            style={{
              width: 70,
              borderWidth: 1,
              borderColor: theme.colors.border,
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
    </View>
  );
}

export default function ConfigScreen() {
  const hidratacaoLembrete = useConfigStore((s) => s.hidratacaoLembrete);
  const toggleHidratacao = useConfigStore((s) => s.toggleHidratacaoLembrete);
  const setIntervalo = useConfigStore((s) => s.setIntervaloHidratacao);

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentContainerClassName="gap-4 p-4 pb-12"
    >
      {/* Period Notifications */}
      <Card className="gap-2">
        <View className="flex-row items-center gap-2 pb-1">
          <Ionicons
            name="notifications-outline"
            size={20}
            color={theme.colors.accent.DEFAULT}
          />
          <Text className="text-base font-semibold text-txt-primary">
            Notificações por Período
          </Text>
        </View>

        <Text className="text-xs text-txt-muted">
          Configure lembretes para cada refeição e período do plano.
        </Text>

        {plano.periodos.map((periodo, index) => (
          <View key={periodo.id}>
            {index > 0 && <View className="h-px bg-border" />}
            <PeriodoNotificacao
              periodoId={periodo.id}
              periodoNome={periodo.nome}
              descricao={periodo.descricao}
            />
          </View>
        ))}
      </Card>

      {/* Hydration Reminders */}
      <Card className="gap-3">
        <View className="flex-row items-center gap-2 pb-1">
          <Ionicons
            name="water-outline"
            size={20}
            color={theme.colors.accent.DEFAULT}
          />
          <Text className="text-base font-semibold text-txt-primary">
            Lembrete de Hidratação
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-medium text-txt-primary">
              Lembretes periódicos
            </Text>
            <Text className="text-xs text-txt-muted">
              Notificações entre 7h e 22h
            </Text>
          </View>
          <Switch
            value={hidratacaoLembrete.enabled}
            onValueChange={toggleHidratacao}
            trackColor={{
              false: theme.colors.bg.elevated,
              true: theme.colors.accent.DEFAULT,
            }}
            thumbColor={theme.colors.text.primary}
          />
        </View>

        {hidratacaoLembrete.enabled && (
          <View className="gap-2">
            <View className="h-px bg-border" />
            <Text className="text-sm text-txt-secondary">
              Intervalo entre lembretes
            </Text>
            <View className="flex-row gap-2">
              {INTERVALO_OPTIONS.map((horas) => {
                const isActive = hidratacaoLembrete.intervaloHoras === horas;
                return (
                  <Pressable
                    key={horas}
                    onPress={() => setIntervalo(horas)}
                    className="flex-1 items-center justify-center rounded-lg py-2.5"
                    style={{
                      backgroundColor: isActive
                        ? theme.colors.accent.DEFAULT
                        : theme.colors.bg.elevated,
                      borderWidth: 1,
                      borderColor: isActive
                        ? theme.colors.accent.DEFAULT
                        : theme.colors.border,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{
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
