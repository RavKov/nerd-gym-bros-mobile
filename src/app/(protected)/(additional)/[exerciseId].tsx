import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

import { getExercise } from "@/src/cache/exercises";
import { QueryStateView } from "@/src/components/QueryStateView";
import { useExercise } from "@/src/hooks/useApiQueries";
import { getMediaUrl } from "@/src/utils/getMediaUrl";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function ExerciseDetails() {
  const copy = useCopy();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = useMemo(() => Number(exerciseId), [exerciseId]);
  const cached = Number.isFinite(id) ? getExercise(id) : undefined;

  const {
    data: fetched,
    isLoading,
    isError,
    error,
    refetch,
  } = useExercise(id, Number.isFinite(id));
  const item = fetched ?? cached ?? null;
  const showLoading = isLoading && !item;

  const player = useVideoPlayer(item?.video ? getMediaUrl(item.video) : null, (p) => {
    p.loop = true;
  });

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView>
        <QueryStateView
          isLoading={showLoading}
          isError={isError && !item}
          error={error}
          onRetry={() => refetch()}
          loadingMessage={copy("exercise_detail_loading")}
          errorTitle={copy("exercise_detail_error_title")}
        >
          {!item ? (
            <Text style={styles.error}>{copy("exercise_detail_not_found")}</Text>
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
                    {copy("exercise_detail_description")}
                  </Text>

                  <Text style={styles.body}>{item.description}</Text>
                </View>
              ) : null}

              <View style={mainStyles.card}>
                <Text style={[mainStyles.title, { fontSize: 20, marginBottom: 8 }]}>
                  {copy("exercise_detail_details")}
                </Text>
                {item.difficulty_level?.name ? (
                  <Text style={styles.row}>
                    <Text style={styles.rowLabel}>{copy("exercise_detail_difficulty")}</Text>
                    {item.difficulty_level.name}
                  </Text>
                ) : null}
                {item.exercise_type?.name ? (
                  <Text style={styles.row}>
                    <Text style={styles.rowLabel}>{copy("exercise_detail_type")}</Text>
                    {item.exercise_type.name}
                  </Text>
                ) : null}
                {item.amount_unit ? (
                  <Text style={styles.row}>
                    <Text style={styles.rowLabel}>{copy("exercise_detail_unit")}</Text>
                    {item.amount_unit}
                  </Text>
                ) : null}
              </View>

              {item.equipments?.length ? (
                <View style={mainStyles.card}>
                  <Text style={[mainStyles.title, { fontSize: 20, marginBottom: 8 }]}>
                    {copy("workout_item_equipment")}
                  </Text>
                  {item.equipments.map((eq) => (
                    <Text key={eq.id} style={styles.row}>
                      - {eq.name}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </QueryStateView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
