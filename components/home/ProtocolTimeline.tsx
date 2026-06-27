import { Text, View } from "react-native"
import { theme, withAlpha } from "@/constants/theme"
import { AppIcon } from "@/components/ui/AppIcon"
import type { ProtocolTimelineItem } from "@/utils/homeUtils"

type ProtocolTimelineProps = {
  items: ProtocolTimelineItem[]
}

function TimelineIcon({ status }: { status: ProtocolTimelineItem["status"] }) {
  if (status === "complete") {
    return (
      <AppIcon
        sf="checkmark.circle.fill"
        mci="check-circle"
        size={18}
        color={theme.colors.semantic.success}
      />
    )
  }

  if (status === "active") {
    return (
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.primary.DEFAULT,
          width: 18,
          textAlign: "center",
        }}
      >
        →
      </Text>
    )
  }

  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: withAlpha(theme.colors.onSurface.variant, 0.5),
      }}
    />
  )
}

export function ProtocolTimeline({ items }: ProtocolTimelineProps) {
  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 20,
        gap: 14,
      }}
    >
      {items.map((item) => (
        <View
          key={item.periodoId}
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <TimelineIcon status={item.status} />
          <Text
            style={{
              ...theme.typography.body,
              fontWeight: item.status === "active" ? "700" : "500",
              color:
                item.status === "upcoming"
                  ? theme.colors.onSurface.variant
                  : item.status === "active"
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.onSurface.DEFAULT,
              opacity: item.status === "complete" ? 0.75 : 1,
            }}
          >
            {item.nome}
          </Text>
        </View>
      ))}
    </View>
  )
}
