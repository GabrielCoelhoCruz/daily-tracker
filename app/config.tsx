import { Text, View } from "react-native";

export default function ConfigScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-card">
      <Text className="text-2xl font-bold text-txt-primary">Configurações</Text>
      <Text className="mt-2 text-txt-secondary">
        Notificações e preferências em breve
      </Text>
    </View>
  );
}
