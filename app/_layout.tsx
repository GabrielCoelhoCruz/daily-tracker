import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Platform, UIManager, View } from "react-native";
import "react-native-reanimated";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import "../global.css";
import { theme } from "@/constants/theme";
import { nativeHeaderGlass } from "@/constants/glassTheme";
import { useConfigStore } from "@/stores/useConfigStore";
import { scheduleNotificacoes } from "@/utils/notificationUtils";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg.primary,
    card: theme.colors.bg.primary,
  },
};

export default function RootLayout() {
  const router = useRouter();
  const configUnsubRef = useRef<(() => void) | null>(null);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...MaterialCommunityIcons.font,
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
    <ThemeProvider value={AppDarkTheme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.primary }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg.primary },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="import-protocol"
            options={{
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.9, 1.0],
              headerShown: true,
              headerTitle: "Importar protocolo",
              headerTransparent: true,
              headerShadowVisible: false,
              headerTintColor: theme.colors.text.primary,
              contentStyle: { backgroundColor: "transparent" },
              ...nativeHeaderGlass,
            }}
          />
          <Stack.Screen
            name="config"
            options={{
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.75, 1.0],
              headerShown: true,
              headerTitle: "Configurações",
              headerTransparent: true,
              headerShadowVisible: false,
              headerTintColor: theme.colors.text.primary,
              contentStyle: { backgroundColor: "transparent" },
              ...nativeHeaderGlass,
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
