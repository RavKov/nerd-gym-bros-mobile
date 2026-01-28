import { ClientProfile } from "./clientProfile";

export type WorkoutPlan = {
    id: number;
    name: string;
    description: string;
    workout_days: WorkoutDay[];
    created_at: string;
    updated_at: string;

};

export type WorkoutDay = {
    id: number;
    workout_plan: number;
    day_number: number;
    description: string;
    workout_items: Exercise[];
    created_at: string;
    updated_at: string;
}

export type WorkoutItem = {
    id: number;
    workout_day: number;
    exercise: Exercise;
    sets: number;
    amount: number;
    order: number;
    created_at: string;
    updated_at: string;
}


export type Exercise = {
    id: number;
    name: string;
    description: string;
    metabolic_equivalent: number;
    video: string | null;
    thumbnail: string | null;
    created_at: string;
    updated_at: string;
    equipments: Equipment[];
    difficulty_level: DifficultyLevel;
    amount_unit: string;
    exercise_type: ExerciseType;
}

export type Equipment = {
    id: number;
    name: string;
}

export type DifficultyLevel = {
    id: number;
    name: string;
}

export type ExerciseType = {
    id: number;
    name: string;
}