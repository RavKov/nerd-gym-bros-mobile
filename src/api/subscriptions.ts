import { api } from "@/src/api/client";
import { fetchAllPages } from "@/src/utils/pagination";
import { fetchClientProfile } from "@/src/api/profile";
import type { StripeSheetResponse } from "@/src/api/types";
import type { Subscription, SubscriptionPlan } from "@/src/types/subscriptionPlan";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return fetchAllPages<SubscriptionPlan>(api, "/api/subscription_plans/");
}

export async function fetchCurrentSubscription(): Promise<Subscription | null> {
  try {
    const res = await api.get<Subscription>("/api/me/subscription/");
    return res.data;
  } catch {
    return null;
  }
}

export async function chooseFreeSubscriptionPlan(subscriptionPlanId: number): Promise<void> {
  await api.post("/api/me/subscription_plan/choose/", {
    subscription_plan_id: subscriptionPlanId,
  });
}

export async function createSubscriptionSheet(
  subscriptionPlanId: number
): Promise<StripeSheetResponse> {
  const res = await api.post<StripeSheetResponse>("/api/create_subscription_sheet/", {
    subscription_plan_id: subscriptionPlanId,
  });
  return res.data;
}

export async function cancelSubscription(): Promise<void> {
  await api.post("/api/cancel_subscription/");
}

export async function waitForSubscriptionPlan(
  planId: number,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const profile = await fetchClientProfile();
    if (profile.subscription_plan === planId) return true;
    await delay(intervalMs);
  }
  return false;
}
