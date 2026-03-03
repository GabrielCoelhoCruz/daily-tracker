import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Markdown from "@ronradtke/react-native-markdown-display";
import { theme } from "@/constants/theme";
import { usePhysiqueStore, PHOTO_LABELS, MODE_LABELS } from "@/stores/usePhysiqueStore";
import { CATEGORY_LABELS } from "@/services/physiqueAnalysis";
import { WeightDelta } from "@/components/physique/WeightDelta";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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
              {checkIn.targetCategory && (
                <View
                  style={{
                    backgroundColor: theme.colors.bg.elevated,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: theme.radius.sm,
                  }}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.accent.DEFAULT }]}>
                    {CATEGORY_LABELS[checkIn.targetCategory]}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Text style={theme.typography.footnote}>{checkIn.date}</Text>
              <Text style={theme.typography.body}>{checkIn.weight}kg</Text>
              <WeightDelta weight={checkIn.weight} previousWeight={checkIn.previousWeight} />
            </View>
          </View>

          {/* Photo thumbnails — plain ScrollView to avoid VirtualizedList nesting */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {checkIn.photoPaths.map((path, index) => (
              <Pressable
                key={index}
                onPress={() => setGalleryIndex(index)}
                accessibilityLabel={`Ver foto ${PHOTO_LABELS[index] ?? index + 1}`}
                accessibilityRole="button"
              >
                <Image
                  source={{ uri: path }}
                  style={{
                    width: 80,
                    height: 107,
                    borderRadius: theme.radius.md,
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Scores */}
          {checkIn.scores &&
            (checkIn.scores.overallConditioning != null ||
              checkIn.scores.stageReadiness != null ||
              checkIn.scores.vTaper != null) && (
              <View className="flex-row" style={{ gap: 8 }}>
                {/* Condicionamento */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.bg.elevated,
                    borderRadius: theme.radius.lg,
                    padding: 12,
                  }}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, marginBottom: 4 }]}>
                    Condicionamento
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.accent.DEFAULT, fontWeight: "700" }]}>
                    {checkIn.scores.overallConditioning != null
                      ? `${checkIn.scores.overallConditioning}/10`
                      : "--"}
                  </Text>
                </View>

                {/* Stage Ready */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.bg.elevated,
                    borderRadius: theme.radius.lg,
                    padding: 12,
                  }}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, marginBottom: 4 }]}>
                    Stage Ready
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.accent.DEFAULT, fontWeight: "700", marginBottom: 6 }]}>
                    {checkIn.scores.stageReadiness != null
                      ? `${checkIn.scores.stageReadiness}%`
                      : "--"}
                  </Text>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: theme.colors.bg.primary,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        width: `${checkIn.scores.stageReadiness ?? 0}%`,
                        backgroundColor: theme.colors.accent.DEFAULT,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>

                {/* V-Taper */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.bg.elevated,
                    borderRadius: theme.radius.lg,
                    padding: 12,
                  }}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.text.secondary, marginBottom: 4 }]}>
                    V-Taper
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.accent.DEFAULT, fontWeight: "700" }]}>
                    {checkIn.scores.vTaper != null
                      ? `${checkIn.scores.vTaper}/10`
                      : "--"}
                  </Text>
                </View>
              </View>
            )}

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

      {/* Fullscreen Gallery */}
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
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: screenWidth,
                  height: screenHeight,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: screenWidth - 32,
                    height: screenHeight * 0.7,
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
