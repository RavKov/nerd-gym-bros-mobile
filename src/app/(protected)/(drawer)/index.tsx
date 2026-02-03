import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/src/components/AppButton";
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, userData, workoutPlanRun, refreshWorkoutPlanRun } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // const [isReady, setIsReady] = useState(false);
  // const hasRedirected = useRef(false);
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //   refreshUserData().finally(() => { setIsReady(true); console.log("User data refreshed in indeex"); });
  // }, [isAuthenticated, refreshUserData]);

  const fetchWorkoutPlanRun = async () => {
    setIsLoading(true);
    try {
      await refreshWorkoutPlanRun();
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletedDaysCount = () => {
    if (!workoutPlanRun) return 0;
    return workoutPlanRun.day_logs.filter(dayLog => dayLog.completed).length;
  }

  const redirectPath = useMemo(() => {
    if (!isAuthenticated) return "/(auth)/login";
    if (!userData) return null;
    if (userData.verified === false) return "/(protected)/(onboarding)/verify_account";
    if (userData.subscription_plan === null) return "/(protected)/(onboarding)/choose_subscription";
    if (userData.active_workout_plan === null) return "/(protected)/(onboarding)/choose_workout_plan";
    return null;
  }, [isAuthenticated, userData]);

  useEffect(() => {
    if (redirectPath) return;
    if (!userData) return;
    fetchWorkoutPlanRun();
  }, [redirectPath, userData]);

  if (redirectPath) {
    return <Redirect href={redirectPath} />;
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      {isLoading ? (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading your plan…</Text>
        </View>
      ) : !workoutPlanRun ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No active plan yet</Text>
          <Text style={styles.emptySubtitle}>Choose a workout plan to get started.</Text>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.subtitle}>Active workout plan run</Text>

          <Text style={styles.title}>{workoutPlanRun.workout_plan.name}</Text>

          <View style={styles.section}>
            <View style={styles.statRow}>
              <View style={styles.statTextWrap}>
                <Text style={styles.statLabel}>Completed days</Text>
                <Text style={styles.statHint}>Track your workout progress</Text>
              </View>
              <Text style={styles.statValue}>
                {getCompletedDaysCount()} / {workoutPlanRun.day_logs.length}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <AppButton
              title="Continue Workout"
              onPress={() => {
                router.push("/(protected)/current_workout");
              }}
              style={styles.primaryAction}
              disabled={isLoading}
            />
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  section: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#5da3ff",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statTextWrap: {
    gap: 2,
  },
  statLabel: {
    fontSize: 18,
    color: "#475569",
    fontWeight: "600",
  },
  statHint: {
    fontSize: 16,
    color: "#94A3B8",
  },
  statValue: {
    fontSize: 22,
    color: "#0F172A",
    fontWeight: "700",
  },
  primaryAction: {
    marginTop: 4,
    width: "100%",
  },
  actionRow: {
    marginTop: 16,
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
});
