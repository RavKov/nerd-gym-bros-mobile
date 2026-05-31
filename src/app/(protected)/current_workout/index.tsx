import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/src/config/api";
import { mainStyles } from "@/src/styles/mainStyles";
export default function CurrentWorkout() {
  const { workoutPlanRun } = useAuth();
  const router = useRouter();
  const [finishing, setFinishing] = useState(false);
  const { refreshUserData } = useAuth();

  const dayLogs = useMemo(() => {
    if (!workoutPlanRun?.day_logs) return [];
    return [...workoutPlanRun.day_logs].sort((a, b) => a.workout_day - b.workout_day);
  }, [workoutPlanRun]);

  const allDaysCompleted = useMemo(
    () => dayLogs.length > 0 && dayLogs.every((day) => day.completed),
    [dayLogs]
  );

  const onCompleteRun = async () => {
    if (!workoutPlanRun || !allDaysCompleted) return;
    setFinishing(true);
    try {
      const result = await api.patch(`/api/me/workout_plan_run/`, {
        finished_at: new Date().toISOString(),
        is_active: false,
      });
      console.log("Workout plan run finalized:", result.data);
      await refreshUserData();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      await refreshUserData();
      router.replace("/(protected)/(drawer)");

      console.error("Failed to finalize workout run:", error);
    } finally {
      setFinishing(false);
    }
  };

  if (!workoutPlanRun) {
    return (
      <SafeAreaView style={mainStyles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No active workout plan</Text>
          <Text style={styles.emptySubtitle}>Choose a plan to generate daily workouts.</Text>
          <AppButton
            title="Choose Workout Plan"
            onPress={() => router.replace("/(protected)/(onboarding)/choose_workout_plan")}
            style={styles.primaryAction}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>{workoutPlanRun.workout_plan.name}</Text>
        <Text style={mainStyles.subtitle}>Your workout schedule</Text>
      </View>

      <FlatList
        data={dayLogs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.footer}>
            <AppButton
              title={
                finishing
                  ? "Finalizing…"
                  : allDaysCompleted
                    ? "Complete workout run"
                    : "Complete all days to finish"
              }
              onPress={onCompleteRun}
              disabled={finishing || !allDaysCompleted}
              style={styles.footerButton}
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const isDone = item.completed;
          const prevDone = index === 0 ? true : dayLogs[index - 1]?.completed;
          const status = isDone ? "Done" : prevDone ? "Go!" : "Inactive";
          const isActive = status === "Go!";

          return (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.dayLabel}>Day {item.workout_day_order_number}</Text>
                {item.description ? (
                  <Text style={styles.dayDescription}>{item.description}</Text>
                ) : null}
                <Text style={styles.dayMeta}>Planned: {item.date}</Text>
              </View>
              <Pressable
                onPress={() => {
                  if (!isActive) return;
                  router.push({
                    pathname: "/(protected)/current_workout/[workout_day_log_id]",
                    params: { workout_day_log_id: String(item.id) },
                  });
                }}
                style={({ pressed }) => [
                  mainStyles.statusButton,
                  isDone && mainStyles.statusButtonDone,
                  isActive && mainStyles.statusButtonGo,
                  !isActive && !isDone && mainStyles.statusButtonInactive,
                  pressed && isActive && mainStyles.statusButtonPressed,
                ]}
              >
                <Text
                  style={[
                    mainStyles.statusButtonText,
                    isDone && mainStyles.statusButtonTextDone,
                    !isActive && !isDone && mainStyles.statusButtonTextInactive,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 16,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  footerButton: {
    width: "100%",
    marginBottom: 24,
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  dayDescription: {
    fontSize: 13,
    color: "#334155",
  },
  dayMeta: {
    fontSize: 12,
    color: "#0052c5",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  primaryAction: {
    marginTop: 6,
    width: "100%",
  },
});
