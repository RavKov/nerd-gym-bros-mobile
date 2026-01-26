import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { VideoView, useVideoPlayer } from "expo-video";

import { api } from "@/src/config/api";
import type { Exercise } from "@/src/types/workoutPlan";
import { getExercise } from "@/src/cache/exercises";
import { API_BASE_URL } from "@/src/config/env";

function getMediaUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
  return `${API_BASE_URL}/${pathOrUrl}`;
}
export default function ExerciseDetails() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = useMemo(() => Number(exerciseId), [exerciseId]);

  const [item, setItem] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const player = useVideoPlayer(item?.video ? getMediaUrl(item.video) : null, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    let cancelled = false;
    
    const fetchDetails = async () => {
      if (!Number.isFinite(id)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cached = getExercise(id);
        if (cached) {
          if (!cancelled) setItem(cached);
          return;
        }

        const res = await api.get<Exercise>(`/api/exercises/${id}`);
        if (!cancelled) setItem(res.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.log("[exercise-details] status:", err.response?.status);
          console.log("[exercise-details] data:", err.response?.data);
        } else {
          console.log("[exercise-details] error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : !item ? (
        <Text style={styles.error}>Nie znaleziono ćwiczenia.</Text>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>

          {item.video ? (
            <View style={styles.videoCard}>
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
              />
            </View>
          ) : null}

          {item.description ? (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Description</Text>

              <Text style={styles.body}>{item.description}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>
            {item.difficulty_level?.name ? (
              <Text style={styles.row}>
                <Text style={styles.rowLabel}>Difficulty: </Text>
                {item.difficulty_level.name}
              </Text>
            ) : null}
            {item.exercise_type?.name ? (
              <Text style={styles.row}>
                <Text style={styles.rowLabel}>Type: </Text>
                {item.exercise_type.name}
              </Text>
            ) : null}
            {item.amount_unit ? (
              <Text style={styles.row}>
                <Text style={styles.rowLabel}>Unit: </Text>
                {item.amount_unit}
              </Text>
            ) : null}
            {typeof item.metabolic_equivalent === "number" ? (
              <Text style={styles.row}>
                <Text style={styles.rowLabel}>MET: </Text>
                {item.metabolic_equivalent}
              </Text>
            ) : null}
          </View>

          {item.equipments?.length ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Equipment</Text>
              {item.equipments.map((eq) => (
                <Text key={eq.id} style={styles.row}>
                  - {eq.name}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  center: {
    paddingVertical: 24,
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  row: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  rowLabel: {
    fontWeight: "700",
  },
  error: {
    color: "#c00",
  },
  videoCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});
