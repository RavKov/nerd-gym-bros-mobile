import { ClientProfile } from "./clientProfile";
import { WorkoutPlan } from "./workoutPlan";

export type WorkoutPlanRun = {
    id: number;
    workout_plan: WorkoutPlan;
    client: ClientProfile;
    started_at: string;
    finished_at: string | null;
    is_active: boolean;
}

export type WorkoutDayLog = {
    id: number;
    workout_plan_run: WorkoutPlanRun;
    workout_day: number;
    date: string;
    completed: boolean;
}

export type WorkoutItemLog = {
    id: number;
    workout_day_log: WorkoutDayLog;
    workout_item: number;
    amount_completed: number;
    completed: boolean;
}