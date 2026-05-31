import { api } from "@/src/config/api";
import type { ClientProfile } from "@/src/types/clientProfile";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Poll profile until Stripe webhook assigns the subscription plan (paid plans). */
export async function waitForSubscriptionPlan(
  planId: number,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await api.get<ClientProfile>("/api/me/detail/");
    if (res.data.subscription_plan === planId) return true;
    await delay(intervalMs);
  }
  return false;
}
