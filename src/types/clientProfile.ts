export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
};

export type ClientProfile = {
  user: User;
  subscription_plan: number | null;
  subscription_start: string;
  subscription_end: string;
  active_workout_plan: number | null;
  age: number;
  weight: number;
  height: number;
  goals: string;
  verified: boolean;
};
