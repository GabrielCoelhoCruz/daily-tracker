import { Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

export function PhysiqueIntelligenceHeader() {
  return (
    <View style={{ gap: 6, paddingHorizontal: 4, marginBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="sparkles"
          mci="creation"
          size={18}
          color={theme.colors.primary.DEFAULT}
        />
        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.5,
          }}
        >
          Physique Intelligence
        </Text>
      </View>
      <Text style={{ ...theme.typography.footnote }}>
        AI-powered stage-readiness tracking.
      </Text>
    </View>
  );
}
