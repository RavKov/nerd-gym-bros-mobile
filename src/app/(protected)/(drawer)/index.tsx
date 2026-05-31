import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/src/components/AppButton";
import { ErrorStateView } from "@/src/components/ErrorStateView";
import { LoadingView } from "@/src/components/LoadingView";
import { mainStyles } from "@/src/styles/mainStyles";
import { useClientProfile, useWorkoutPlanRun } from "@/src/hooks/useApiQueries";
import { useCopy } from "@/src/i18n/useCopy";

export default function Index() {
  const router = useRouter();
  const copy = useCopy();
  const {
    isAuthenticated,
    userData,
    workoutPlanRun,
    isLoading: authBootstrapping,
    refreshSession,
  } = useAuth();
  const profileQuery = useClientProfile(isAuthenticated);
  const workoutRunQuery = useWorkoutPlanRun(isAuthenticated);

  const getCompletedDaysCount = () => {
    if (!workoutPlanRun) return 0;
    return workoutPlanRun.day_logs.filter((dayLog) => dayLog.completed).length;
  };

  const redirectPath = useMemo(() => {
    if (!isAuthenticated) return "/(auth)/login";
    if (authBootstrapping || profileQuery.isLoading) return null;
    if (profileQuery.isError || !userData) return null;
    if (userData.verified === false) return "/(protected)/(onboarding)/verify_account";
    if (userData.subscription_plan === null) return "/(protected)/(onboarding)/choose_subscription";
    if (userData.active_workout_plan === null)
      return "/(protected)/(onboarding)/choose_workout_plan";
    return null;
  }, [isAuthenticated, authBootstrapping, profileQuery.isLoading, profileQuery.isError, userData]);

  if (redirectPath) {
    return <Redirect href={redirectPath} />;
  }

  if (profileQuery.isError) {
    return (
      <SafeAreaView style={mainStyles.container}>
        <ErrorStateView
          title={copy("home_profile_error_title")}
          message={copy("home_profile_error_message")}
          onRetry={() => {
            void refreshSession();
          }}
        />
      </SafeAreaView>
    );
  }

  const isLoading = authBootstrapping || profileQuery.isLoading || workoutRunQuery.isFetching;

  return (
    <SafeAreaView style={mainStyles.container}>
      {isLoading ? (
        <LoadingView message={copy("home_loading_plan")} />
      ) : !workoutPlanRun ? (
        <View style={styles.center}>
          <Text style={mainStyles.emptyTitle}>{copy("home_empty_plan_title")}</Text>
          <Text style={mainStyles.emptySubtitle}>{copy("home_empty_plan_subtitle")}</Text>
        </View>
      ) : (
        <View style={mainStyles.header}>
          <Text style={mainStyles.subtitle}>{copy("home_active_run_subtitle")}</Text>

          <Text style={mainStyles.title}>{workoutPlanRun.workout_plan.name}</Text>

          <View style={styles.section}>
            <View style={styles.statRow}>
              <View style={styles.statTextWrap}>
                <Text style={styles.statLabel}>{copy("home_stat_completed_days")}</Text>
                <Text style={styles.statHint}>{copy("home_stat_hint")}</Text>
              </View>
              <Text style={styles.statValue}>
                {getCompletedDaysCount()} / {workoutPlanRun.day_logs.length}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <AppButton
              title={copy("home_continue_workout")}
              onPress={() => {
                router.push("/(protected)/current_workout");
              }}
              style={styles.primaryAction}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
