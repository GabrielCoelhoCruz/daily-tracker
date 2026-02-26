import { Text, View } from "react-native";

export default function HojeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-primary">
      <Text className="text-2xl font-bold text-txt-primary">Hoje</Text>
      <Text className="mt-2 text-txt-secondary">
        Checklist diário em breve
      </Text>
    </View>
  );
}
