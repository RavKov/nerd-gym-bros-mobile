import { api } from "@/src/api/client";
import { fetchAllPages } from "@/src/utils/pagination";
import type { WorkoutItem, WorkoutPlan } from "@/src/types/workoutPlan";
import type { SetLog, WorkoutPlanRun } from "@/src/types/workoutPlanRun";

export async function fetchWorkoutPlans(): Promise<WorkoutPlan[]> {
  return fetchAllPages<WorkoutPlan>(api, "/api/workout_plans/");
}

export async function chooseWorkoutPlan(workoutPlanId: number): Promise<void> {
  await api.post("/api/me/workout_plan/", { workout_plan_id: workoutPlanId });
}

export async function fetchWorkoutPlanRun(): Promise<WorkoutPlanRun> {
  const res = await api.get<WorkoutPlanRun>("/api/me/workout_plan_run/");
  return res.data;
}

export async function finalizeWorkoutPlanRun(finishedAt: string): Promise<void> {
  await api.patch("/api/me/workout_plan_run/", {
    finished_at: finishedAt,
    is_active: false,
  });
}

export type WorkoutDayDetailedLog = {
  id: number;
  date: string;
  completed: boolean;
  description: string;
  day_number: number;
  item_logs: Array<{
    id: number;
    completed: boolean;
    workout_item: WorkoutItem;
    set_logs: SetLog[];
  }>;
};

export async function fetchWorkoutDayLog(id: number): Promise<WorkoutDayDetailedLog> {
  const res = await api.get<WorkoutDayDetailedLog>(`/api/me/workout_day_log/${id}/`);
  return res.data;
}

export async function completeWorkoutDay(id: number): Promise<void> {
  await api.patch(`/api/me/workout_day_log/${id}/`, { completed: true });
}

export type WorkoutItemDetailedLog = {
  id: number;
  completed: boolean;
  notes: string | null;
  set_logs: SetLog[];
  workout_item: WorkoutItem;
};

export async function fetchWorkoutItemLog(id: number): Promise<WorkoutItemDetailedLog> {
  const res = await api.get<WorkoutItemDetailedLog>(`/api/me/workout_item_log/${id}/`);
  return res.data;
}

export async function completeWorkoutItem(id: number): Promise<void> {
  await api.patch(`/api/me/workout_item_log/${id}/`, { completed: true });
}

export async function updateSetLog(id: number, actualAmount: number | null): Promise<void> {
  await api.patch(`/api/me/set_log/${id}/`, { actual_amount: actualAmount });
}
