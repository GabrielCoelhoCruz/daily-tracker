import { Text, View } from "react-native"
import { theme, withAlpha } from "@/constants/theme"

type HomeSectionHeaderProps = {
  title: string
}

export function HomeSectionHeader({ title }: HomeSectionHeaderProps) {
  return (
    <View
      style={{
        paddingHorizontal: 4,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text
        style={{
          ...theme.typography.labelMedium,
          color: theme.colors.onSurface.variant,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.07),
        }}
      />
    </View>
  )
}
