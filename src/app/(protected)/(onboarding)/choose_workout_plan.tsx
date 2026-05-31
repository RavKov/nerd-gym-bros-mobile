import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { chooseWorkoutPlan } from "@/src/api/workouts";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { mainStyles } from "@/src/styles/mainStyles";
import { useWorkoutPlans } from "@/src/hooks/useApiQueries";

export default function ChooseWorkoutPlan() {
  const { data: workoutPlans = [] } = useWorkoutPlans();
  const { userData, refreshUserData, refreshWorkoutPlanRun } = useAuth();
  const router = useRouter();

  const onChoosePlan = async (planId: number) => {
    try {
      await chooseWorkoutPlan(planId);
      Alert.alert("Success", "Workout plan updated successfully.");
      await Promise.all([refreshUserData(), refreshWorkoutPlanRun()]);
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      alertAxiosError("Workout plan error", error);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.contentCenter}>
        <View>
          <Text style={mainStyles.warningText}>
            Warning! Changing your workout plan will reset your current progress.
          </Text>
        </View>
        {workoutPlans.map((plan) => (
          <View
            key={plan.id}
            style={[
              mainStyles.planOptionCard,
              plan.id === userData?.active_workout_plan && mainStyles.planOptionCardSelected,
            ]}
          >
            <Text style={[mainStyles.title, { fontSize: 18, marginBottom: 12 }]}>{plan.name}</Text>
            <Text style={{ fontSize: 16 }}>{plan.description}</Text>
            <AppButton
              disabled={plan.id === userData?.active_workout_plan}
              onPress={() => onChoosePlan(plan.id)}
              title={
                plan.id === userData?.active_workout_plan ? "Currently selected" : "Choose Plan"
              }
              style={{ marginTop: 12 }}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
