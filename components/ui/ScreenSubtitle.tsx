import { Text, View } from "react-native";
import { theme } from "@/constants/theme";

type ScreenSubtitleProps = {
  text: string;
  secondary?: string;
};

export function ScreenSubtitle({ text, secondary }: ScreenSubtitleProps) {
  return (
    <View style={{ gap: 4, paddingHorizontal: 4, paddingBottom: 16 }}>
      <Text style={{ ...theme.typography.footnote, lineHeight: 18 }}>
        {text}
      </Text>
      {secondary ? (
        <Text
          style={{
            ...theme.typography.callout,
            color: theme.colors.primary.DEFAULT,
          }}
        >
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}
