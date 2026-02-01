import { Stack } from "expo-router";

export default function AdditionalLayout() {
    return (
        <Stack>
            <Stack.Screen name="bug_report" options={{ headerTitle:'Bug report' }} />

            <Stack.Screen name="new_feature_request" options={{ headerTitle:'New feature request' }} />

            <Stack.Screen name="[exerciseId]" options={{ headerTitle:'Exercise Details' }} />
            <Stack.Screen name="[workout_day]" options={{ headerTitle:'Workout Day' }} />
        </Stack>
    );
}