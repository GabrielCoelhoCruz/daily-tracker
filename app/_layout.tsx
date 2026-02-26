import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "../global.css";
import { useConfigStore } from "@/stores/useConfigStore";
import { scheduleNotificacoes } from "@/utils/notificationUtils";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const configUnsubRef = useRef<(() => void) | null>(null);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle notification taps — navigate to app via Expo Router
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (data?.type === "periodo") {
          router.push("/");
        } else if (data?.type === "hidratacao") {
          router.push("/");
        }
      }
    );
    return () => subscription.remove();
  }, [router]);

  // Subscribe to config store changes and reschedule notifications (debounced)
  useEffect(() => {
    if (Platform.OS === "web") return;

    // Schedule on mount
    scheduleNotificacoes();

    // Reschedule when config changes, debounced to avoid excessive calls
    let debounceTimer: ReturnType<typeof setTimeout>;
    configUnsubRef.current = useConfigStore.subscribe(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        scheduleNotificacoes();
      }, 1000);
    });

    return () => {
      clearTimeout(debounceTimer);
      configUnsubRef.current?.();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1, backgroundColor: "#0c0a09" }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0c0a09" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="config"
            options={{
              presentation: "modal",
              headerShown: true,
              headerTitle: "Configurações",
              headerStyle: { backgroundColor: "#1c1917" },
              headerTintColor: "#fafaf9",
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
