import { Text, View } from "react-native";

export default function TreinoScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-primary">
      <Text className="text-2xl font-bold text-txt-primary">Treino</Text>
      <Text className="mt-2 text-txt-secondary">
        Treino do dia em breve
      </Text>
    </View>
  );
}
