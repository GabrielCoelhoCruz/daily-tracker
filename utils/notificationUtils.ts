import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useConfigStore } from "@/stores/useConfigStore";
import { plano } from "@/data/plano";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

function parseHorario(horario: string): { hour: number; minute: number } | null {
  const parts = horario.split(":");
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

export async function cancelAllNotificacoes(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelHydrationNotificacoes(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    const data = notif.content.data as Record<string, unknown> | undefined;
    if (data?.type === "hidratacao") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleNotificacoes(): Promise<void> {
  if (Platform.OS === "web") return;

  const granted = await requestPermission();
  if (!granted) return;

  await cancelAllNotificacoes();

  const config = useConfigStore.getState();
  const { notificacoesPorPeriodo, hidratacaoLembrete } = config;

  // Schedule period notifications
  for (const periodo of plano.periodos) {
    const periodoConfig = notificacoesPorPeriodo[periodo.id];
    if (!periodoConfig?.enabled) continue;

    const time = parseHorario(periodoConfig.horario);
    if (!time) continue;

    const descricao = periodo.descricao ? ` — ${periodo.descricao}` : "";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🍽️ ${periodo.nome}`,
        body: `Hora do(a) ${periodo.nome}${descricao}. Não esqueça de marcar no app!`,
        data: { type: "periodo", periodoId: periodo.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }

  // Schedule hydration reminders
  if (hidratacaoLembrete.enabled) {
    const intervalHours = hidratacaoLembrete.intervaloHoras;
    const START_HOUR = 7;
    const END_HOUR = 22;

    for (let hour = START_HOUR; hour <= END_HOUR; hour += intervalHours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hidratação",
          body: "Lembre-se de beber água! Meta: 4L de água + 500ml chá de cavalinha.",
          data: { type: "hidratacao" },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Math.floor(hour),
          minute: 0,
        },
      });
    }
  }
}
