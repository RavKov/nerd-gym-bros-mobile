import {
  completeWorkoutDay,
  fetchWorkoutDayLog,
  type WorkoutDayDetailedLog,
} from "@/src/api/workouts";
import { AppButton } from "@/src/components/AppButton";
import { useAuth } from "@/src/context/AuthContext";
import { mainStyles } from "@/src/styles/mainStyles";
import { Exercise } from "@/src/types/workoutPlan";
import { getMediaUrl } from "@/src/utils/getMediaUrl";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDay() {
  const [detailedDayLog, setDetailedDayLog] = useState<WorkoutDayDetailedLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { workout_day_log_id } = useLocalSearchParams<{ workout_day_log_id: string }>();
  const { isAuthenticated, refreshWorkoutPlanRun, workoutPlanRun } = useAuth();
  const router = useRouter();

  const fetchDetailedDayLog = async (dayLogId: number) => {
    setLoading(true);
    try {
      setDetailedDayLog(await fetchWorkoutDayLog(dayLogId));
    } catch (error) {
      console.error("Failed to fetch detailed day log:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentIds = () => {
    if (!detailedDayLog) return new Set<number>();
    const equipmentIds = new Set<number>();
    detailedDayLog.item_logs.forEach((itemLog) => {
      const workoutItem = itemLog.workout_item;
      if (workoutItem.exercise && workoutItem.exercise.equipments) {
        workoutItem.exercise.equipments.forEach((eq) => equipmentIds.add(eq.id));
      }
    });
    return equipmentIds;
  };

  const redirectToEquippedGyms = () => {
    const equipmentIds = Array.from(getEquipmentIds());
    router.replace({
      pathname: "/(protected)/(drawer)/gyms",
      params: { equipment_ids: equipmentIds.join(",") },
    });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const dayLogId = Number(workout_day_log_id);
    fetchDetailedDayLog(dayLogId);
  }, [isAuthenticated, workout_day_log_id, workoutPlanRun]);

  const onCompleteDay = async () => {
    if (detailedDayLog?.item_logs.some((itemLog) => !itemLog.completed)) {
      Alert.alert("Please complete all exercises before completing the day.");
      return;
    }

    if (!detailedDayLog) return;
    setSaving(true);
    try {
      await completeWorkoutDay(detailedDayLog.id);
      setDetailedDayLog({ ...detailedDayLog, completed: true });
      await refreshWorkoutPlanRun();
      router.back();
    } catch (error) {
      console.error("Failed to complete workout day:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>Day {detailedDayLog?.day_number ?? workout_day_log_id}</Text>
        <Text style={mainStyles.subtitle}>{detailedDayLog?.description ?? "Workout details"}</Text>
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <AppButton
              title={
                detailedDayLog?.completed ? "Day Completed" : saving ? "Saving…" : "Complete Day"
              }
              onPress={saving || detailedDayLog?.completed ? undefined : onCompleteDay}
              style={{ marginTop: 12 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Find equipped gyms"
              variant="secondary"
              onPress={redirectToEquippedGyms}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading workout…</Text>
        </View>
      ) : detailedDayLog ? (
        <FlatList
          data={detailedDayLog.item_logs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const exercise: Exercise = item.workout_item.exercise;
            const completed = item.completed;
            const prevCompleted =
              index === 0 ? true : detailedDayLog.item_logs[index - 1]?.completed;
            const status = completed ? "Done" : prevCompleted ? "Go!" : "Inactive";
            const isActive = status === "Go!";
            const sets = item.workout_item.sets;
            const amount = item.workout_item.amount;
            const unit = exercise?.amount_unit ? ` ${exercise.amount_unit}` : "";

            return (
              <View style={styles.card}>
                <View style={styles.thumbnailWrap}>
                  {exercise?.thumbnail ? (
                    <Image
                      source={{ uri: getMediaUrl(exercise.thumbnail) }}
                      style={styles.thumbnail}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder} />
                  )}
                </View>

                <View style={styles.textColumn}>
                  <Text style={styles.name} numberOfLines={1}>
                    {exercise?.name ?? "Exercise"}
                  </Text>
                  {exercise?.difficulty_level?.name || exercise?.exercise_type?.name ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      {exercise?.difficulty_level?.name ?? ""}
                      {exercise?.difficulty_level?.name && exercise?.exercise_type?.name
                        ? "  •  "
                        : ""}
                      {exercise?.exercise_type?.name ?? ""}
                    </Text>
                  ) : null}
                  <Text style={styles.details} numberOfLines={1}>
                    {`${sets} sets  •  ${amount}${unit}`}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    if (!isActive) return;
                    router.push({
                      pathname: "/(protected)/current_workout/exercise/[workout_item_log_id]",
                      params: { workout_item_log_id: String(item.id) },
                    });
                  }}
                  style={({ pressed }) => [
                    mainStyles.statusButton,
                    completed && mainStyles.statusButtonDone,
                    isActive && mainStyles.statusButtonGo,
                    !isActive && !completed && mainStyles.statusButtonInactive,
                    pressed && isActive && mainStyles.statusButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      mainStyles.statusButtonText,
                      completed && mainStyles.statusButtonTextDone,
                      !isActive && !completed && mainStyles.statusButtonTextInactive,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={mainStyles.emptyTitle}>No data available</Text>
          <Text style={mainStyles.emptySubtitle}>Please go back and try again.</Text>
        </View>
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
  thumbnailWrap: {
    width: 64,
    height: 64,
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
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#64748B",
  },
  details: {
    fontSize: 12,
    color: "#334155",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },
});
