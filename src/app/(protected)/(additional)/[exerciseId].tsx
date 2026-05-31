import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchExercise } from "@/src/api/exercises";
import type { Exercise } from "@/src/types/workoutPlan";
import { getExercise } from "@/src/cache/exercises";
import { getMediaUrl } from "@/src/utils/getMediaUrl";
import { mainStyles } from "@/src/styles/mainStyles";
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

        const exercise = await fetchExercise(id);
        if (!cancelled) setItem(exercise);
      } catch (err) {
        if (__DEV__) {
          console.warn("[exercise-details]", err);
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
    <SafeAreaView style={mainStyles.container}>
      <ScrollView>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : !item ? (
          <Text style={styles.error}>Could not find the exercise.</Text>
        ) : (
          <View style={styles.content}>
            <Text style={mainStyles.title}>{item.name}</Text>

            {item.video ? (
              <View style={mainStyles.videoCard}>
                <VideoView
                  player={player}
                  style={mainStyles.video}
                  nativeControls
                  contentFit="contain"
                />
              </View>
            ) : null}

            {item.description ? (
              <View style={mainStyles.card}>
                <Text style={[mainStyles.title, { fontSize: 20, marginBottom: 8 }]}>
                  Description
                </Text>

                <Text style={styles.body}>{item.description}</Text>
              </View>
            ) : null}

            <View style={mainStyles.card}>
              <Text style={[mainStyles.title, { fontSize: 20, marginBottom: 8 }]}>Details</Text>
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
            </View>

            {item.equipments?.length ? (
              <View style={mainStyles.card}>
                <Text style={[mainStyles.title, { fontSize: 20, marginBottom: 8 }]}>Equipment</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
  },
  content: {
    gap: 12,
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
});
