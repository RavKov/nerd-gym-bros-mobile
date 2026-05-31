export type SubscriptionPlan = {
  id: number;
  name: string;
  price: number;
  stripe_price_id?: string | null;
  features: string;
  workout_plans: number[];
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: number;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
};
