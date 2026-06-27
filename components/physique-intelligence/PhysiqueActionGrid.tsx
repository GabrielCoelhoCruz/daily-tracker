import { Pressable, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

type ActionItem = {
  key: string;
  label: string;
  sf: string;
  mci: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
};

type PhysiqueActionGridProps = {
  checkInCount: number;
  profileComplete: boolean;
  onNewCheckIn: () => void;
  onCompare: () => void;
  onCategoryFinder: () => void;
  onProfile: () => void;
};

export function PhysiqueActionGrid({
  checkInCount,
  profileComplete,
  onNewCheckIn,
  onCompare,
  onCategoryFinder,
  onProfile,
}: PhysiqueActionGridProps) {
  const compareDisabled = checkInCount < 2;

  const actions: ActionItem[] = [
    {
      key: "new-checkin",
      label: "New Check-in",
      sf: "camera.viewfinder",
      mci: "camera-outline",
      onPress: onNewCheckIn,
      primary: true,
      accessibilityLabel: "New check-in",
    },
    {
      key: "compare",
      label: "Compare",
      sf: "square.on.square",
      mci: "compare",
      onPress: onCompare,
      disabled: compareDisabled,
      accessibilityLabel: compareDisabled
        ? "Compare check-ins, unavailable until you have at least two check-ins"
        : "Compare check-ins",
    },
    {
      key: "categories",
      label: "Category Finder",
      sf: "magnifyingglass",
      mci: "magnify",
      onPress: onCategoryFinder,
      disabled: !profileComplete,
      accessibilityLabel: "Category Finder",
    },
    {
      key: "profile",
      label: "Profile",
      sf: "person.crop.circle",
      mci: "account-outline",
      onPress: onProfile,
      accessibilityLabel: "Athlete profile",
    },
  ];

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          ...theme.typography.caption,
          fontWeight: "700",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          paddingHorizontal: 4,
        }}
      >
        Actions
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {actions.map((action) => {
          const isDisabled = action.disabled ?? false;
          const isPrimary = action.primary ?? false;

          return (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityState={{ disabled: isDisabled }}
              style={{
                flexGrow: 1,
                flexBasis: "47%",
                minHeight: 52,
                borderRadius: theme.radius.lg,
                backgroundColor: isPrimary
                  ? theme.colors.primary.container
                  : theme.colors.surface.containerHigh,
                borderWidth: 1,
                borderColor: isPrimary
                  ? withAlpha(theme.colors.primary.DEFAULT, 0.35)
                  : withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 14,
                opacity: isDisabled ? 0.45 : 1,
                gap: 6,
              }}
            >
              <AppIcon
                sf={action.sf as never}
                mci={action.mci as never}
                size={18}
                color={
                  isPrimary
                    ? "#000"
                    : isDisabled
                      ? theme.colors.onSurface.variant
                      : theme.colors.onSurface.DEFAULT
                }
              />
              <Text
                style={{
                  ...theme.typography.callout,
                  fontSize: 14,
                  color: isPrimary ? "#000" : theme.colors.onSurface.DEFAULT,
                  textAlign: "center",
                }}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
