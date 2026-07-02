import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import { getLogicalDate } from "@/utils/dateUtils";
import {
  clearDemoData,
  getDemoSeedStats,
  hasDemoData,
  seedDemoData,
} from "@/utils/demoSeedUtils";

export function DemoModeCard() {
  const [isActive, setIsActive] = useState(() => hasDemoData());
  const referenceDate = getLogicalDate(new Date());
  const stats = getDemoSeedStats(referenceDate);

  function activateDemo() {
    seedDemoData(referenceDate);
    setIsActive(true);
  }

  function handleActivateDemo() {
    if (Platform.OS === "web") {
      activateDemo();
      return;
    }

    Alert.alert(
      "Ativar modo demo",
      "Isso vai preencher o ShapeIQ com dados locais de demonstração (histórico, check-ins, treinos e perfil demo). Dados reais com IDs demo serão substituídos; outros dados permanecem.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Ativar",
          onPress: activateDemo,
        },
      ],
    );
  }

  function handleClearDemo() {
    Alert.alert(
      "Limpar dados demo",
      "Remove apenas registros prefixados com demo- e dias de histórico demo. Seus dados reais são preservados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            clearDemoData(referenceDate);
            setIsActive(hasDemoData(referenceDate));
          },
        },
      ],
    );
  }

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.18),
        padding: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="sparkles"
          mci="star-four-points-outline"
          size={16}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            ...theme.typography.overline,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          Modo demo
        </Text>
      </View>

      <Text style={{ ...theme.typography.body }}>
        Popule o ShapeIQ com uma semana realista de prep para screenshots, vídeos
        e testes manuais.
      </Text>

      {isActive ? (
        <Text style={{ ...theme.typography.footnote }}>
          Modo demo ativo · {stats.historyDays} dias · {stats.checkIns} check-ins
          · {stats.sessions} sessões
        </Text>
      ) : (
        <Text style={{ ...theme.typography.footnote }}>
          Narrativa demo: cutting, execução ~82%, cardio como principal
          vazamento, treino parcial hoje.
        </Text>
      )}

      <View style={{ gap: 10 }}>
        <Pressable
          onPress={handleActivateDemo}
          accessibilityRole="button"
          accessibilityLabel="Ativar modo demo"
          style={{
            minHeight: 44,
            borderRadius: theme.radius.lg,
            backgroundColor: withAlpha(theme.colors.primary.DEFAULT, 0.14),
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.primary.DEFAULT, 0.24),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...theme.typography.callout,
              fontWeight: "700",
              color: theme.colors.primary.DEFAULT,
            }}
          >
            Ativar modo demo
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClearDemo}
          accessibilityRole="button"
          accessibilityLabel="Limpar dados demo"
          style={{
            minHeight: 44,
            borderRadius: theme.radius.lg,
            backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
            borderWidth: 1,
            borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.08),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ ...theme.typography.callout, fontWeight: "600" }}>
            Limpar dados demo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
