import { Text, View } from "react-native"
import { theme } from "@/constants/theme"

type HomeSectionHeaderProps = {
  title: string
}

export function HomeSectionHeader({ title }: HomeSectionHeaderProps) {
  return (
    <View style={{ paddingHorizontal: 4, marginBottom: 12 }}>
      <Text
        style={{
          ...theme.typography.labelMedium,
          color: theme.colors.onSurface.variant,
        }}
      >
        {title}
      </Text>
    </View>
  )
}
