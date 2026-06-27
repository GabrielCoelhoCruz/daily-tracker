import { Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function PrepReviewHeader() {
  return (
    <View style={{ gap: 4, paddingHorizontal: 4, paddingTop: 4 }}>
      <Text
        style={{
          ...theme.typography.headlineLarge,
          fontSize: 34,
          fontWeight: "700",
          letterSpacing: -0.5,
        }}
      >
        Prep Review
      </Text>
      <Text style={{ ...theme.typography.footnote, lineHeight: 18 }}>
        Padrões de execução do seu protocolo diário.
      </Text>
    </View>
  );
}
