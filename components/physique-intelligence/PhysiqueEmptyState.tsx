import { Pressable, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

type PhysiqueEmptyStateProps = {
  onNewCheckIn: () => void;
  onPhotoGuide: () => void;
};

export function PhysiqueEmptyState({
  onNewCheckIn,
  onPhotoGuide,
}: PhysiqueEmptyStateProps) {
  return (
    <View
      className="items-center"
      style={{
        gap: 12,
        paddingVertical: 32,
        paddingHorizontal: 8,
      }}
    >
      <AppIcon
        sf="chart.line.uptrend.xyaxis"
        mci="chart-timeline-variant-shimmer"
        size={48}
        color={theme.colors.onSurface.variant}
      />
      <Text style={{ ...theme.typography.callout, textAlign: "center" }}>
        Nenhum check-in ainda
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          textAlign: "center",
        }}
      >
        Evidência começa com a primeira foto. Crie seu primeiro check-in para
        acompanhar a tendência do shape.
      </Text>

      <Pressable
        onPress={onNewCheckIn}
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
        accessibilityLabel="Novo check-in"
      >
        <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
          Novo Check-in
        </Text>
      </Pressable>

      <Pressable
        onPress={onPhotoGuide}
        style={{
          minHeight: 44,
          justifyContent: "center",
          paddingHorizontal: 12,
        }}
        accessibilityRole="button"
        accessibilityLabel="Guia de fotos"
      >
        <Text
          style={{
            ...theme.typography.callout,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          Guia de fotos
        </Text>
      </Pressable>
    </View>
  );
}
