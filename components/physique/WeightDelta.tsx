import { Text } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  weight: number;
  previousWeight?: number;
  fontSize?: number;
};

export function WeightDelta({ weight, previousWeight, fontSize = 13 }: Props) {
  if (previousWeight == null) return null;

  const delta = (weight - previousWeight).toFixed(1);
  const isNegative = Number(delta) < 0;

  return (
    <Text
      style={{
        color: isNegative
          ? theme.colors.semantic.success
          : theme.colors.semantic.error,
        fontSize,
        fontWeight: "600",
      }}
    >
      {Number(delta) > 0 ? "+" : ""}
      {delta}kg
    </Text>
  );
}
