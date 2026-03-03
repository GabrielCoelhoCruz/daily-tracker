import { View, Text, Pressable, Image, Alert, ActionSheetIOS } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "@/constants/theme";

const LABELS = ["Frontal", "Lateral", "Costas", "Extra"] as const;

type PhotoSlot = { uri: string; label: string } | null;

type Props = {
  photos: PhotoSlot[];
  onAdd: (index: number, uri: string) => void;
  onRemove: (index: number) => void;
  visibleSlots?: number;
};

async function requestAndPick(source: "camera" | "gallery"): Promise<string | null> {
  if (source === "camera") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Habilite o acesso à câmera nas configurações do dispositivo."
      );
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    return result.canceled ? null : result.assets[0].uri;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permissão necessária",
      "Habilite o acesso à galeria nas configurações do dispositivo."
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

function showSourcePicker(onPick: (source: "camera" | "gallery") => void) {
  if (process.env.EXPO_OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ["Cancelar", "Câmera", "Galeria"], cancelButtonIndex: 0 },
      (index) => {
        if (index === 1) onPick("camera");
        if (index === 2) onPick("gallery");
      }
    );
  } else {
    Alert.alert("Adicionar foto", "Escolha a origem", [
      { text: "Câmera", onPress: () => onPick("camera") },
      { text: "Galeria", onPress: () => onPick("gallery") },
      { text: "Cancelar", style: "cancel" },
    ]);
  }
}

export function PhotoSlots({ photos, onAdd, onRemove, visibleSlots = 4 }: Props) {
  const handleAdd = (index: number) => {
    showSourcePicker(async (source) => {
      const uri = await requestAndPick(source);
      if (uri) onAdd(index, uri);
    });
  };

  return (
    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
      {LABELS.slice(0, visibleSlots).map((label, i) => {
        const photo = photos[i];
        return (
          <View key={label} style={{ width: "47%" }}>
            {photo ? (
              <View style={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: theme.radius.lg }}
                />
                <Pressable
                  onPress={() => onRemove(i)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  accessibilityLabel={`Remover foto ${label}`}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="close" size={16} color="#fff" />
                </Pressable>
                <Text
                  style={[
                    theme.typography.caption,
                    { textAlign: "center", marginTop: 4 },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => handleAdd(i)}
                style={{
                  aspectRatio: 3 / 4,
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: theme.colors.text.muted,
                  borderRadius: theme.radius.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                }}
                accessibilityLabel={`Adicionar foto ${label}`}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={28}
                  color={theme.colors.text.muted}
                />
                <Text style={[theme.typography.caption, { marginTop: 4 }]}>
                  {label}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}
