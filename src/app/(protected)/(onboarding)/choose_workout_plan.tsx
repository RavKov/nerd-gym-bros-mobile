import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { QueryStateView } from "@/src/components/QueryStateView";
import { chooseWorkoutPlan } from "@/src/api/workouts";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { mainStyles } from "@/src/styles/mainStyles";
import { useWorkoutPlans } from "@/src/hooks/useApiQueries";
import { useCopy } from "@/src/i18n/useCopy";

export default function ChooseWorkoutPlan() {
  const copy = useCopy();
  const { data: workoutPlans = [], isLoading, isError, error, refetch } = useWorkoutPlans();
  const { userData, refreshUserData, refreshWorkoutPlanRun } = useAuth();
  const router = useRouter();

  const onChoosePlan = async (planId: number) => {
    try {
      await chooseWorkoutPlan(planId);
      Alert.alert(copy("common_success"), copy("workout_plan_updated"));
      await Promise.all([refreshUserData(), refreshWorkoutPlanRun()]);
      router.replace("/(protected)/(drawer)");
    } catch (err) {
      alertAxiosError(copy("workout_plan_error_title"), err);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <QueryStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        loadingMessage={copy("workout_plan_loading")}
        errorTitle={copy("workout_plan_load_error_title")}
      >
        <View style={mainStyles.contentCenter}>
          <View>
            <Text style={mainStyles.warningText}>{copy("workout_plan_warning")}</Text>
          </View>
          {workoutPlans.map((plan) => (
            <View
              key={plan.id}
              style={[
                mainStyles.planOptionCard,
                plan.id === userData?.active_workout_plan && mainStyles.planOptionCardSelected,
              ]}
            >
              <Text style={[mainStyles.title, { fontSize: 18, marginBottom: 12 }]}>
                {plan.name}
              </Text>
              <Text style={{ fontSize: 16 }}>{plan.description}</Text>
              <AppButton
                disabled={plan.id === userData?.active_workout_plan}
                onPress={() => onChoosePlan(plan.id)}
                title={
                  plan.id === userData?.active_workout_plan
                    ? copy("workout_plan_currently_selected")
                    : copy("workout_plan_choose")
                }
                style={{ marginTop: 12 }}
              />
            </View>
          ))}
        </View>
      </QueryStateView>
    </SafeAreaView>
  );
}
