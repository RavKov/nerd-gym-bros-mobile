import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack>
            <Stack.Screen name="choose_subscription" options={{ headerTitle:'Choose Subscription' }} />
            <Stack.Screen name="choose_workout_plan" options={{ headerTitle:'Choose Workout Plan' }} />
            <Stack.Screen name="verify_account" options={{ headerTitle:'Verify Account' }} />
        </Stack>
    );
}