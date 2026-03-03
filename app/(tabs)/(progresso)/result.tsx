import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Markdown from "@ronradtke/react-native-markdown-display";
import { theme } from "@/constants/theme";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const PHOTO_LABELS = ["Frontal", "Lateral", "Costas", "Extra"];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MODE_LABELS: Record<string, string> = {
  full: "Completa",
  comparative: "Comparativa",
  quick: "Quick",
};

const markdownStyles = {
  body: { color: theme.colors.text.primary, fontSize: 15 },
  heading1: { color: theme.colors.accent.DEFAULT, fontSize: 20, fontWeight: "700" as const },
  heading2: { color: theme.colors.accent.DEFAULT, fontSize: 18, fontWeight: "700" as const },
  heading3: { color: theme.colors.text.primary, fontSize: 16, fontWeight: "600" as const },
  strong: { color: theme.colors.text.primary, fontWeight: "700" as const },
  em: { color: theme.colors.text.secondary },
  bullet_list: { color: theme.colors.text.primary },
  ordered_list: { color: theme.colors.text.primary },
  list_item: { color: theme.colors.text.primary },
  code_inline: {
    backgroundColor: theme.colors.bg.elevated,
    color: theme.colors.accent.DEFAULT,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: theme.colors.bg.elevated,
    color: theme.colors.text.primary,
    padding: 12,
    borderRadius: theme.radius.lg,
  },
  fence: {
    backgroundColor: theme.colors.bg.elevated,
    color: theme.colors.text.primary,
    padding: 12,
    borderRadius: theme.radius.lg,
  },
  hr: { backgroundColor: theme.colors.border },
  blockquote: { borderLeftColor: theme.colors.accent.DEFAULT, paddingLeft: 12 },
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const checkIn = usePhysiqueStore((s) => s.checkIns.find((c) => c.id === id));
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  if (!checkIn) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text style={theme.typography.body}>Check-in não encontrado</Text>
      </View>
    );
  }

  const delta =
    checkIn.previousWeight != null
      ? (checkIn.weight - checkIn.previousWeight).toFixed(1)
      : null;

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-primary"
      >
        <View className="p-4" style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Text style={theme.typography.title3}>Semana {checkIn.week}</Text>
              <View
                style={{
                  backgroundColor: theme.colors.bg.elevated,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.accent.DEFAULT }]}>
                  {MODE_LABELS[checkIn.mode] ?? checkIn.mode}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Text style={theme.typography.footnote}>{checkIn.date}</Text>
              <Text style={theme.typography.body}>{checkIn.weight}kg</Text>
              {delta && (
                <Text
                  style={{
                    color:
                      Number(delta) < 0
                        ? theme.colors.semantic.success
                        : theme.colors.semantic.error,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {Number(delta) > 0 ? "+" : ""}
                  {delta}kg
                </Text>
              )}
            </View>
          </View>

          {/* Photo thumbnails */}
          <FlatList
            data={checkIn.photoPaths}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setGalleryIndex(index)}
                accessibilityLabel={`Ver foto ${PHOTO_LABELS[index] ?? index + 1}`}
                accessibilityRole="button"
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 80,
                    height: 107,
                    borderRadius: theme.radius.md,
                  }}
                />
              </Pressable>
            )}
          />

          {/* Analysis */}
          {checkIn.analysis ? (
            <Markdown style={markdownStyles}>{checkIn.analysis}</Markdown>
          ) : (
            <View className="items-center py-8" style={{ gap: 8 }}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={48}
                color={theme.colors.text.muted}
              />
              <Text style={theme.typography.footnote}>
                Análise não disponível
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fullscreen Gallery - US-009 */}
      <Modal
        visible={galleryIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryIndex(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)" }}>
          <Pressable
            onPress={() => setGalleryIndex(null)}
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Fechar galeria"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="close" size={22} color="#fff" />
          </Pressable>

          <FlatList
            data={checkIn.photoPaths}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={galleryIndex ?? 0}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: SCREEN_WIDTH - 32,
                    height: SCREEN_HEIGHT * 0.7,
                    borderRadius: theme.radius.lg,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    marginTop: 12,
                    fontWeight: "600",
                  }}
                >
                  {PHOTO_LABELS[index] ?? `Foto ${index + 1}`}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
