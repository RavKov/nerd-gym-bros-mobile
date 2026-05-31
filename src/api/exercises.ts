import { api } from "@/src/api/client";
import { fetchAllPages } from "@/src/utils/pagination";
import type { Exercise } from "@/src/types/workoutPlan";

export async function fetchExercises(): Promise<Exercise[]> {
  return fetchAllPages<Exercise>(api, "/api/exercises/");
}

export async function fetchExercise(id: number): Promise<Exercise> {
  const res = await api.get<Exercise>(`/api/exercises/${id}/`);
  return res.data;
}
