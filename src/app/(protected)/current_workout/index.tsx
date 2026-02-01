import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CurrentWorkout() {
	const { workoutPlanRun } = useAuth();
	const router = useRouter();

	const dayLogs = useMemo(() => {
		if (!workoutPlanRun?.day_logs) return [];
		return [...workoutPlanRun.day_logs].sort((a, b) => a.workout_day - b.workout_day);
	}, [workoutPlanRun]);

	if (!workoutPlanRun) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.center}>
					<Text style={styles.emptyTitle}>No active workout plan</Text>
					<Text style={styles.emptySubtitle}>Choose a plan to generate daily workouts.</Text>
					<AppButton
						title="Choose Workout Plan"
						onPress={() => router.replace("/(protected)/(onboarding)/choose_workout_plan")}
						style={styles.primaryAction}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>{workoutPlanRun.workout_plan.name}</Text>
				<Text style={styles.subtitle}>Your workout schedule</Text>
			</View>

			<FlatList
				data={dayLogs}
				keyExtractor={(item) => String(item.id)}
				contentContainerStyle={styles.list}
				renderItem={({ item, index }) => {
					const isDone = item.completed;
					const prevDone = index === 0 ? true : dayLogs[index - 1]?.completed;
					const status = isDone ? "Done" : prevDone ? "Go!" : "Inactive";
					const isActive = status === "Go!";

					return (
						<View style={styles.row}>
							<View style={styles.rowLeft}>
								<Text style={styles.dayLabel}>Day {item.workout_day}</Text>
								{item.description ? (
									<Text style={styles.dayDescription}>{item.description}</Text>
								) : null}
								<Text style={styles.dayMeta}>Planned: {item.date}</Text>
							</View>
							<Pressable
								onPress={() => {
									if (!isActive) return;
									router.push({
										pathname: "/(protected)/current_workout/[workout_day_log_id]",
										params: { workout_day_log_id: String(item.id) },
									});
								}}
								style={({ pressed }) => [
									styles.statusButton,
									isDone && styles.statusDone,
									isActive && styles.statusGo,
									!isActive && !isDone && styles.statusInactive,
									pressed && isActive && styles.statusPressed,
								]}
							>
								<Text
									style={[
										styles.statusText,
										isDone && styles.statusTextDone,
										!isActive && !isDone && styles.statusTextInactive,
									]}
								>
									{status}
								</Text>
							</Pressable>
						</View>
					);
				}}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	header: {
		paddingHorizontal: 4,
		paddingVertical: 8,
		gap: 4,
		marginBottom: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "#1D4ED8",
	},
	subtitle: {
		fontSize: 14,
		color: "#475569",
	},
	list: {
		gap: 10,
		paddingBottom: 16,
	},
	row: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#BFDBFE",
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	rowLeft: {
		flex: 1,
		gap: 4,
	},
	dayLabel: {
		fontSize: 16,
		fontWeight: "700",
		color: "#0F172A",
	},
	dayDescription: {
		fontSize: 13,
		color: "#334155",
	},
	dayMeta: {
		fontSize: 12,
		color: "#64748B",
	},
	statusButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#CBD5F5",
		backgroundColor: "#EFF6FF",
	},
	statusGo: {
		borderColor: "#2563EB",
		backgroundColor: "#DBEAFE",
	},
	statusDone: {
		borderColor: "#16A34A",
		backgroundColor: "#DCFCE7",
	},
	statusInactive: {
		borderColor: "#E2E8F0",
		backgroundColor: "#F1F5F9",
	},
	statusPressed: {
		transform: [{ scale: 0.98 }],
	},
	statusText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E40AF",
	},
	statusTextDone: {
		color: "#15803D",
	},
	statusTextInactive: {
		color: "#94A3B8",
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 12,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#0F172A",
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#475569",
		textAlign: "center",
	},
	primaryAction: {
		marginTop: 6,
		width: "100%",
	},
});
