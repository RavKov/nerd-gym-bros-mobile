export type SubscriptionPlan = {
    id: number;
    name: string;
    price: number;
    stripe_price_id?: string | null;
    duration_days: number;
    features: string;
    workout_plans: number[];
    created_at: string;
    updated_at: string;
 };
 