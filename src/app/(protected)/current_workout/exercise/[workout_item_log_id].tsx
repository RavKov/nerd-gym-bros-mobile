import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";

import {
  completeWorkoutItem,
  fetchWorkoutItemLog,
  updateSetLog,
  type WorkoutItemDetailedLog,
} from "@/src/api/workouts";
import { getMediaUrl } from "@/src/utils/getMediaUrl";
import { useAuth } from "@/src/context/AuthContext";
import { mainStyles } from "@/src/styles/mainStyles";

export default function WorkoutItem() {
  const { refreshWorkoutPlanRun } = useAuth();
  const { workout_item_log_id } = useLocalSearchParams<{ workout_item_log_id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemLog, setItemLog] = useState<WorkoutItemDetailedLog | null>(null);
  const [amountBySetId, setAmountBySetId] = useState<Record<number, string>>({});

  const sanitizeAmount = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    if (!digitsOnly) return "";
    const numeric = Number.parseInt(digitsOnly, 10);
    if (!Number.isFinite(numeric)) return "";
    return String(Math.min(1000, numeric));
  };

  const setList = useMemo(() => itemLog?.set_logs ?? [], [itemLog]);

  const player = useVideoPlayer(
    itemLog?.workout_item.exercise.video ? getMediaUrl(itemLog?.workout_item.exercise.video) : null,
    (p) => {
      p.loop = true;
    }
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!workout_item_log_id) return;
      const id = Number(workout_item_log_id);
      if (!Number.isFinite(id)) return;
      try {
        setLoading(true);
        const data = await fetchWorkoutItemLog(id);
        if (!cancelled) {
          setItemLog(data);
          const map: Record<number, string> = {};
          data.set_logs.forEach((s) => {
            map[s.id] =
              s.actual_amount !== null && s.actual_amount !== undefined
                ? String(s.actual_amount)
                : "";
          });
          setAmountBySetId(map);
        }
      } catch (error) {
        console.error("Failed to fetch workout item log:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [workout_item_log_id]);

  const updateSetAmount = async (setId: number, value: string) => {
    const sanitized = sanitizeAmount(value);
    const numeric = sanitized === "" ? null : Number(sanitized);
    if (numeric !== null && Number.isNaN(numeric)) return;

    setAmountBySetId((prev) => ({ ...prev, [setId]: sanitized }));
    try {
      await updateSetLog(setId, numeric);
    } catch (error) {
      console.error("Failed to update set amount:", error);
    }
  };

  const onComplete = async () => {
    if (!itemLog) return;
    setSaving(true);
    try {
      await Promise.all(
        setList.map((setLog) => updateSetAmount(setLog.id, amountBySetId[setLog.id] ?? ""))
      );
      await completeWorkoutItem(itemLog.id);
      await refreshWorkoutPlanRun();
      setItemLog({ ...itemLog, completed: true });
      router.back();
    } catch (error) {
      console.error("Failed to complete workout item:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading exercise…</Text>
        </View>
      ) : !itemLog ? (
        <View style={styles.center}>
          <Text style={mainStyles.emptyTitle}>No data available</Text>
          <Text style={mainStyles.emptySubtitle}>Please go back and try again.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={mainStyles.title}>{itemLog.workout_item.exercise.name}</Text>
          <View style={mainStyles.card}>
            <Text style={styles.cardTitle}>Description</Text>

            <Text style={styles.cardBody}>{itemLog.workout_item.exercise.description}</Text>

            {itemLog.workout_item.exercise.equipments?.length ? (
              <>
                <Text style={styles.cardTitle}>Equipment</Text>
                {itemLog.workout_item.exercise.equipments.map((eq) => (
                  <Text key={eq.id}>- {eq.name}</Text>
                ))}
              </>
            ) : null}
          </View>

          <View style={mainStyles.card}>
            <Text style={styles.setsLabel}>
              Target: {itemLog.workout_item.amount} {itemLog.workout_item.exercise.amount_unit}
            </Text>
            <View style={styles.setsWrap}>
              {setList.map((item, index) => (
                <View key={item.id} style={styles.setChip}>
                  <Text style={styles.setChipLabel}>Set {item.set_number ?? index + 1}</Text>
                  <TextInput
                    value={amountBySetId[item.id] ?? ""}
                    onChangeText={(value) => {
                      const sanitized = sanitizeAmount(value);
                      setAmountBySetId((prev) => ({ ...prev, [item.id]: sanitized }));
                    }}
                    onEndEditing={() => updateSetAmount(item.id, amountBySetId[item.id] ?? "")}
                    placeholder="0"
                    keyboardType="numeric"
                    maxLength={4}
                    style={styles.setChipInput}
                  />
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              <Text
                style={styles.completeButton}
                onPress={saving || itemLog.completed ? undefined : onComplete}
              >
                {itemLog.completed ? "Completed" : saving ? "Saving…" : "Finish Exercise"}
              </Text>
            </View>
          </View>

          <View style={mainStyles.videoCard}>
            <VideoView
              player={player}
              style={mainStyles.video}
              nativeControls
              contentFit="contain"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  setsLabel: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  setsWrap: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: 10,
  },
  setChip: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 8,
  },
  setChipLabel: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "700",
  },
  setChipInput: {
    minWidth: 48,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 18,
    textAlign: "center",
  },
  actions: {
    gap: 8,
  },
  completeButton: {
    textAlign: "center",
    backgroundColor: "#1D4ED8",
    color: "#fff",
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    fontWeight: "700",
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardBody: {
    fontSize: 14,
    marginBottom: 8,
    color: "#334155",
  },
});
