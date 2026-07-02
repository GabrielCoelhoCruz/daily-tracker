import { NativeTabs, Icon, Label, VectorIcon, Badge } from "expo-router/unstable-native-tabs";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { DynamicColorIOS, Platform } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@/constants/theme";
import { nativeTabBarGlass } from "@/constants/glassTheme";

import { usePendingDashCount } from "@/hooks/usePendingDashCount";
import { useProtocolStore } from "@/stores/useProtocolStore";



export const unstable_settings = {

  initialRouteName: "(hoje)",

};



const tabTint =

  Platform.OS === "ios"

    ? DynamicColorIOS({

        dark: theme.colors.primary.DEFAULT,

        light: theme.colors.primary.container,

      })

    : theme.colors.primary.DEFAULT;



const tabLabelColor =

  Platform.OS === "ios"

    ? DynamicColorIOS({

        dark: theme.colors.onSurface.variant,

        light: theme.colors.onSurface.variant,

      })

    : theme.colors.onSurface.variant;



export default function TabLayout() {

  // Gate de onboarding: só entra nas tabs após concluir o onboarding
  // (ou ativar o modo demo, que marca onboardingComplete).
  const onboardingComplete = useProtocolStore((s) => s.onboardingComplete);

  // A persistência (AsyncStorage) reidrata de forma assíncrona. Sem esperar a
  // hidratação, o valor default (false) redirecionaria usuários já onboardados
  // para o onboarding a cada reinício do app.
  const [hydrated, setHydrated] = useState(() =>
    useProtocolStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useProtocolStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, [hydrated]);

  const pendingDash = usePendingDashCount();

  if (!hydrated) {
    return null;
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const badgeLabel =

    pendingDash > 0 ? (pendingDash > 99 ? "99+" : String(pendingDash)) : undefined;



  return (

    <NativeTabs
      tintColor={tabTint}
      {...nativeTabBarGlass}
      labelStyle={{ color: tabLabelColor }}
    >

      <NativeTabs.Trigger name="(hoje)">

        <Icon

          sf={{ default: "sun.max", selected: "sun.max.fill" }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: (

                    <VectorIcon

                      family={MaterialCommunityIcons}

                      name="white-balance-sunny"

                    />

                  ),

                  selected: (

                    <VectorIcon family={MaterialCommunityIcons} name="white-balance-sunny" />

                  ),

                }

              : undefined

          }

        />

        <Label>Hoje</Label>

      </NativeTabs.Trigger>



      <NativeTabs.Trigger name="(protocolo)">

        <Icon

          sf={{ default: "checklist", selected: "checklist" }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: (

                    <VectorIcon

                      family={MaterialCommunityIcons}

                      name="format-list-checks"

                    />

                  ),

                  selected: (

                    <VectorIcon

                      family={MaterialCommunityIcons}

                      name="format-list-checks"

                    />

                  ),

                }

              : undefined

          }

        />

        <Label>Protocolo</Label>

        {badgeLabel ? (
          <Badge selectedBackgroundColor={theme.colors.accent.DEFAULT}>
            {badgeLabel}
          </Badge>
        ) : null}

      </NativeTabs.Trigger>



      <NativeTabs.Trigger name="(treino)">

        <Icon

          sf={{ default: "dumbbell", selected: "dumbbell.fill" }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: <VectorIcon family={MaterialCommunityIcons} name="dumbbell" />,

                  selected: <VectorIcon family={MaterialCommunityIcons} name="dumbbell" />,

                }

              : undefined

          }

        />

        <Label>Treino</Label>

      </NativeTabs.Trigger>



      <NativeTabs.Trigger name="(historico)">

        <Icon

          sf={{
            default: "chart.bar.doc.horizontal",
            selected: "chart.bar.doc.horizontal.fill",
          }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: (

                    <VectorIcon

                      family={MaterialCommunityIcons}

                      name="calendar-month-outline"

                    />

                  ),

                  selected: (

                    <VectorIcon family={MaterialCommunityIcons} name="calendar-month" />

                  ),

                }

              : undefined

          }

        />

        <Label>Logs</Label>

      </NativeTabs.Trigger>



      <NativeTabs.Trigger name="(progresso)">

        <Icon

          sf={{
            default: "camera.metering.matrix",
            selected: "camera.metering.matrix",
          }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: <VectorIcon family={MaterialCommunityIcons} name="image-multiple-outline" />,

                  selected: <VectorIcon family={MaterialCommunityIcons} name="image-multiple" />,

                }

              : undefined

          }

        />

        <Label>Evidências</Label>

      </NativeTabs.Trigger>

    </NativeTabs>

  );

}


