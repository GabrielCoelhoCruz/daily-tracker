import { Text, View } from "react-native";

export default function HistoricoScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-primary">
      <Text className="text-2xl font-bold text-txt-primary">Histórico</Text>
      <Text className="mt-2 text-txt-secondary">
        Calendário e estatísticas em breve
      </Text>
    </View>
  );
}
