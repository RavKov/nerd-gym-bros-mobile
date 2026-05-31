import { View, Text, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { chooseWorkoutPlan, fetchWorkoutPlans } from "@/src/api/workouts";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { WorkoutPlan } from "@/src/types/workoutPlan";
import { mainStyles } from "@/src/styles/mainStyles";

export default function ChooseWorkoutPlan() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const { userData, refreshUserData, refreshWorkoutPlanRun } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    fetchWorkoutPlans()
      .then((plans) => {
        if (!cancelled) setWorkoutPlans(plans);
      })
      .catch((error) => console.error("Failed to fetch workout plans:", error));

    return () => {
      cancelled = true;
    };
  }, [userData?.subscription_plan]);

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
