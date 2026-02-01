import { ClientProfile } from "./clientProfile";
import { WorkoutDay, WorkoutPlan } from "./workoutPlan";

export type WorkoutPlanRun = {
    id: number;
    workout_plan: WorkoutPlan;
    client: number;
    started_at: string;
    finished_at: string | null;
    is_active: boolean;
    day_logs: WorkoutDayLog[];
}

export type WorkoutDayLog = {
    id: number;
    description: string;
    workout_plan_run: number;
    workout_day: number;
    date: string;
    completed: boolean;
    item_logs: WorkoutItemLog[];
}
    
export type WorkoutItemLog = {
    id: number;
    workout_day_log: number;
    workout_item: number;
    amount_completed: number;
    completed: boolean;
    set_logs: SetLog[];

}

export type SetLog = {
    id: number;
    set_number: number;
    actual_amount: number;
    weight: number | null;
    workout_item_log: number;
}