import { Stack } from "expo-router";

export default function CurrentWorkoutLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle:'Current Workout' }} />
            <Stack.Screen name="[workout_day_log_id]" options={{ headerTitle:'Workout Day' }} />
            <Stack.Screen name="exercise/[workout_item_log_id]" options={{ headerTitle:'Current Exercise' }} />
        </Stack>
    );
}