import { NativeTabs, Icon, Label, VectorIcon, Badge } from "expo-router/unstable-native-tabs";

import { DynamicColorIOS, Platform } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { theme } from "@/constants/theme";
import { nativeTabBarGlass } from "@/constants/glassTheme";

import { usePendingDashCount } from "@/hooks/usePendingDashCount";



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

  const pendingDash = usePendingDashCount();

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

          sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: (

                    <VectorIcon

                      family={MaterialCommunityIcons}

                      name="check-circle-outline"

                    />

                  ),

                  selected: (

                    <VectorIcon family={MaterialCommunityIcons} name="check-circle" />

                  ),

                }

              : undefined

          }

        />

        <Label>Hoje</Label>

        {badgeLabel ? <Badge>{badgeLabel}</Badge> : null}

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

          sf={{ default: "calendar", selected: "calendar" }}

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

          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}

          androidSrc={

            Platform.OS === "android"

              ? {

                  default: <VectorIcon family={MaterialCommunityIcons} name="chart-bar" />,

                  selected: <VectorIcon family={MaterialCommunityIcons} name="chart-bar" />,

                }

              : undefined

          }

        />

        <Label>Stats</Label>

      </NativeTabs.Trigger>

    </NativeTabs>

  );

}


