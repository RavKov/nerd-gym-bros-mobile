import { View, Text, Alert, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

import { useEffect, useState } from "react";
import { api } from "@/src/config/api";
import axios from "axios";
import { WorkoutPlan } from "@/src/types/workoutPlan";
import { AppButton } from "@/src/components/AppButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { mainStyles } from "@/src/styles/mainStyles";
export default function ChooseWorkoutPlan() {
  const [workoutPlans, setWorkoutPlans] = useState<Array<WorkoutPlan>>([]);
  const { userData, setUserData, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const fetchWorkoutPlans = async () => {
      try {
        const response = await api.get<Array<WorkoutPlan>>("/api/workout_plans/");
        if (response.status === 200) {
          if (!cancelled) setWorkoutPlans(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch workout plans:", error);
      }
    };

    fetchWorkoutPlans();

    return () => {
      cancelled = true;
    };
  }, [userData?.subscription_plan]);

  const onChoosePlan = async (planId: number) => {
    try {
      const response = await api.post(`/api/me/workout_plan/`, { workout_plan_id: planId });
      if (response.status === 200) {
        Alert.alert("Success", "Workout plan updated successfully.");
        await refreshUserData();
        router.replace("/(protected)/(drawer)");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("[choose workout plan] status:", error.response?.status);
        console.log("[choose workout plan] data:", error.response?.data);
        Alert.alert("Workout Plan Error", String(error.response?.data?.detail ?? error.message));
        return;
      }
      console.error("Failed to choose workout plan:", error);
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
