import type { ClientProfile } from "@/src/types/clientProfile";

export type OnboardingRedirectInput = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isProfileLoading: boolean;
  isProfileError: boolean;
  userData: ClientProfile | null;
};

export function getOnboardingRedirectPath(input: OnboardingRedirectInput): string | null {
  if (!input.isAuthenticated) return "/(auth)/login";
  if (input.isBootstrapping || input.isProfileLoading) return null;
  if (input.isProfileError || !input.userData) return null;
  if (input.userData.verified === false) return "/(protected)/(onboarding)/verify_account";
  if (input.userData.subscription_plan === null) {
    return "/(protected)/(onboarding)/choose_subscription";
  }
  if (input.userData.active_workout_plan === null) {
    return "/(protected)/(onboarding)/choose_workout_plan";
  }
  return null;
}
