import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { setExercises } from "@/src/cache/exercises";
import { useExercises } from "@/src/hooks/useApiQueries";
import { getMediaUrl } from "@/src/utils/getMediaUrl";
import { mainStyles } from "@/src/styles/mainStyles";

export default function AllExercises() {
  const { data: items = [], isLoading } = useExercises();
  const router = useRouter();

  useEffect(() => {
    if (items.length > 0) setExercises(items);
  }, [items]);

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>Exercises</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(additional)/[exerciseId]",
                  params: { exerciseId: String(item.id) },
                })
              }
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.thumbnailWrap}>
                {item.thumbnail ? (
                  <Image source={{ uri: getMediaUrl(item.thumbnail) }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.thumbnailPlaceholder} />
                )}
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.difficulty_level?.name || item.exercise_type?.name ? (
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.difficulty_level?.name ?? ""}
                    {item.difficulty_level?.name && item.exercise_type?.name ? "  •  " : ""}
                    {item.exercise_type?.name ?? ""}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: "#eee",
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#444",
  },
});
