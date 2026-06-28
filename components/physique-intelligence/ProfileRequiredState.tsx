import { Pressable, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

type ProfileRequiredStateProps = {
  onConfigureProfile: () => void;
};

export function ProfileRequiredState({
  onConfigureProfile,
}: ProfileRequiredStateProps) {
  return (
    <View
      className="items-center"
      style={{
        gap: 12,
        paddingVertical: 48,
        paddingHorizontal: 8,
      }}
    >
      <AppIcon
        sf="person.crop.circle"
        mci="account-outline"
        size={48}
        color={theme.colors.onSurface.variant}
      />
      <Text style={{ ...theme.typography.callout, textAlign: "center" }}>
        Configure seu perfil de atleta
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          textAlign: "center",
        }}
      >
        Isso habilita categorização, contexto de análise IA e acompanhamento de
        prontidão para o palco.
      </Text>

      <Pressable
        onPress={onConfigureProfile}
        style={{
          backgroundColor: theme.colors.primary.container,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: theme.radius.lg,
          marginTop: 8,
          minHeight: 44,
          justifyContent: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel="Configurar perfil"
      >
        <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
          Configurar Perfil
        </Text>
      </Pressable>
    </View>
  );
}
