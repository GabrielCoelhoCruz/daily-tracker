import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-bg-primary p-5">
        <Text className="text-xl font-bold text-txt-primary">
          Tela não encontrada
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-accent">Ir para a tela inicial</Text>
        </Link>
      </View>
    </>
  );
}
