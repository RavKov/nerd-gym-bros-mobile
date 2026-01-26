import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import {useAuth} from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

import {useEffect, useState} from "react";
import {api} from "@/src/config/api";
import axios from "axios";
import { RefreshControl } from "react-native-gesture-handler";
import { WorkoutPlan } from "@/src/types/workoutPlan";
import { AppButton } from "@/src/components/AppButton";

export default function ChooseWorkoutPlan() {
    const [workoutPlans, setWorkoutPlans] = useState<Array<WorkoutPlan>>([]);
    const { userData, setUserData, refreshUserData } = useAuth();
    const router = useRouter();

    useEffect(() => {
      let cancelled = false;

      const fetchWorkoutPlans = async () => {
            try {
                const response = await api.get<Array<WorkoutPlan>>('/api/workout_plans/');
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
            const response = await api.post(`/api/me/workout_plan/`, {workout_plan_id: planId});
            if (response.status === 200) {
                Alert.alert("Success", "Workout plan updated successfully.");
                refreshUserData();
                router.replace("/(protected)");
            }
        }
        catch (error) {
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
    <View style={styles.container}>
        <View>
            <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center", paddingHorizontal: 20}}>Warning! Changing your workout plan will reset your current progress.</Text>
        </View>
        {workoutPlans.map((plan) => (
            <View
                key={plan.id}
          style={[
            styles.planContainer,
            plan.id === userData?.active_workout_plan && styles.planContainerSelected,
          ]}
                
            >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{plan.name}</Text>
                <Text style={{ fontSize: 16 }}>{plan.description}</Text>
                <AppButton
                  disabled={plan.id === userData?.active_workout_plan}
                  onPress={() => onChoosePlan(plan.id)}
                  title={plan.id === userData?.active_workout_plan ? "Currently selected" : "Choose Plan"}
                  style={styles.chooseButton}
                />
            </View>
        ))} 


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planContainer: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  planContainerSelected: {
    borderColor: '#007BFF',
    borderWidth: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 16,
    marginTop: 8,
  },
  chooseButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
});