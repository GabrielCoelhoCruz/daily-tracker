import { Text, View } from "react-native";
import { theme } from "@/constants/theme";

type ScreenSubtitleProps = {
  text: string;
  secondary?: string;
};

export function ScreenSubtitle({ text, secondary }: ScreenSubtitleProps) {
  return (
    <View style={{ gap: 6, paddingHorizontal: 4, paddingBottom: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 14,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.colors.primary.container,
          }}
        />
        <Text
          style={{
            ...theme.typography.overline,
            lineHeight: 16,
          }}
        >
          {text}
        </Text>
      </View>
      {secondary ? (
        <Text
          style={{
            ...theme.typography.callout,
            fontSize: 17,
            fontWeight: "700",
            letterSpacing: -0.3,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}
