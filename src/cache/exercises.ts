import type { Exercise } from "@/src/types/workoutPlan";

const byId = new Map<number, Exercise>();

export function setExercises(exercises: Exercise[]) {
  for (const exercise of exercises) byId.set(exercise.id, exercise);
}

export function getExercise(id: number) {
  return byId.get(id) ?? null;
}
