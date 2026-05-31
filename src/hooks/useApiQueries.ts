import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchExercise, fetchExercises } from "@/src/api/exercises";
import { fetchMobileAppContent } from "@/src/api/content";
import { fetchEquipments, fetchGyms } from "@/src/api/gyms";
import { fetchClientProfile } from "@/src/api/profile";
import { fetchCurrentSubscription, fetchSubscriptionPlans } from "@/src/api/subscriptions";
import {
  fetchWorkoutDayLog,
  fetchWorkoutItemLog,
  fetchWorkoutPlanRunOrNull,
  fetchWorkoutPlans,
} from "@/src/api/workouts";
import { useAuth } from "@/src/context/AuthContext";

export const queryKeys = {
  profile: ["profile"] as const,
  workoutPlanRun: ["workoutPlanRun"] as const,
  exercises: ["exercises"] as const,
  exercise: (id: number) => ["exercise", id] as const,
  workoutPlans: ["workoutPlans"] as const,
  subscriptionPlans: ["subscriptionPlans"] as const,
  subscription: ["subscription"] as const,
  gyms: ["gyms"] as const,
  equipments: ["equipments"] as const,
  content: ["content"] as const,
  workoutDayLog: (id: number) => ["workoutDayLog", id] as const,
  workoutItemLog: (id: number) => ["workoutItemLog", id] as const,
};

export function useClientProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchClientProfile,
    enabled,
  });
}

export function useWorkoutPlanRun(enabled = true) {
  return useQuery({
    queryKey: queryKeys.workoutPlanRun,
    queryFn: fetchWorkoutPlanRunOrNull,
    enabled,
  });
}

export function useExercises(enabled = true) {
  return useQuery({
    queryKey: queryKeys.exercises,
    queryFn: fetchExercises,
    enabled,
  });
}

export function useExercise(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.exercise(id),
    queryFn: () => fetchExercise(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useWorkoutPlans(enabled = true) {
  return useQuery({
    queryKey: queryKeys.workoutPlans,
    queryFn: fetchWorkoutPlans,
    enabled,
  });
}

export function useSubscriptionPlans(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: fetchSubscriptionPlans,
    enabled,
  });
}

export function useCurrentSubscription(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: fetchCurrentSubscription,
    enabled,
  });
}

export function useGyms(enabled = true) {
  return useQuery({
    queryKey: queryKeys.gyms,
    queryFn: fetchGyms,
    enabled,
  });
}

export function useEquipments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.equipments,
    queryFn: fetchEquipments,
    enabled,
  });
}

export function useMobileContent() {
  return useQuery({
    queryKey: queryKeys.content,
    queryFn: fetchMobileAppContent,
    staleTime: 5 * 60_000,
  });
}

export function useWorkoutDayLog(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.workoutDayLog(id),
    queryFn: () => fetchWorkoutDayLog(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useWorkoutItemLog(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.workoutItemLog(id),
    queryFn: () => fetchWorkoutItemLog(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useInvalidateUserQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
    invalidateWorkoutPlanRun: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlanRun }),
    invalidateAll: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlanRun }),
      ]);
    },
  };
}

/** Profile + workout run for screens that only need auth-gated server state. */
export function useAuthUserData() {
  const { isAuthenticated } = useAuth();
  const profile = useClientProfile(isAuthenticated);
  const workoutRun = useWorkoutPlanRun(isAuthenticated);

  return {
    userData: profile.data ?? null,
    workoutPlanRun: workoutRun.data ?? null,
    isProfileLoading: profile.isLoading,
    isWorkoutRunLoading: workoutRun.isLoading,
  };
}
