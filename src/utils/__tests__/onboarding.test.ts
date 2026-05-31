import { getOnboardingRedirectPath } from "@/src/utils/onboarding";
import type { ClientProfile } from "@/src/types/clientProfile";

function profile(overrides: Partial<ClientProfile> = {}): ClientProfile {
  return {
    user: {
      id: 1,
      username: "test",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      is_active: true,
    },
    subscription_plan: 1,
    subscription_start: "",
    subscription_end: "",
    active_workout_plan: 2,
    age: 25,
    weight: 80,
    height: 180,
    goals: "",
    verified: true,
    ...overrides,
  };
}

const ready = {
  isAuthenticated: true,
  isBootstrapping: false,
  isProfileLoading: false,
  isProfileError: false,
  userData: profile(),
};

describe("getOnboardingRedirectPath", () => {
  it("redirects unauthenticated users to login", () => {
    expect(getOnboardingRedirectPath({ ...ready, isAuthenticated: false })).toBe("/(auth)/login");
  });

  it("waits while session or profile is loading", () => {
    expect(getOnboardingRedirectPath({ ...ready, isBootstrapping: true })).toBeNull();
    expect(getOnboardingRedirectPath({ ...ready, isProfileLoading: true })).toBeNull();
  });

  it("waits when profile failed or is missing", () => {
    expect(getOnboardingRedirectPath({ ...ready, isProfileError: true })).toBeNull();
    expect(getOnboardingRedirectPath({ ...ready, userData: null })).toBeNull();
  });

  it("routes through onboarding steps in order", () => {
    expect(getOnboardingRedirectPath({ ...ready, userData: profile({ verified: false }) })).toBe(
      "/(protected)/(onboarding)/verify_account"
    );

    expect(
      getOnboardingRedirectPath({ ...ready, userData: profile({ subscription_plan: null }) })
    ).toBe("/(protected)/(onboarding)/choose_subscription");

    expect(
      getOnboardingRedirectPath({ ...ready, userData: profile({ active_workout_plan: null }) })
    ).toBe("/(protected)/(onboarding)/choose_workout_plan");
  });

  it("returns null when onboarding is complete", () => {
    expect(getOnboardingRedirectPath(ready)).toBeNull();
  });
});
