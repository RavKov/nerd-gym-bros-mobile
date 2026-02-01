import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/config/api";
import type { Exercise, WorkoutItem } from "@/src/types/workoutPlan";
import { API_BASE_URL } from "@/src/config/env";
import { SetLog } from "@/src/types/workoutPlanRun";
import { SafeAreaView } from "react-native-safe-area-context";

function getMediaUrl(pathOrUrl: string) {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
	return `${API_BASE_URL}/${pathOrUrl}`;
}

type DetailedDayLog = {
	id: number;
	item_logs: Array<{
		id: number;
		workout_item: WorkoutItem;
		set_logs: SetLog[];
		completed: boolean;
		// notes: string | null;
	}>;
	day_number: number;
	description: string;
	date: string;
	completed: boolean;

}

export default function WorkoutDay() {
	const [detailedDayLog, setDetailedDayLog] = useState<DetailedDayLog | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const { workout_day_log_id } = useLocalSearchParams<{ workout_day_log_id: string }>();
	const { isAuthenticated, refreshWorkoutPlanRun, workoutPlanRun } = useAuth();
	const router = useRouter();

	const fetchDetailedDayLog = async (dayLogId: number) => {
		setLoading(true);
		try {
			const response = await api.get<DetailedDayLog>(`/api/me/workout_day_log/${dayLogId}/`);
			if (response.status === 200) {
				setDetailedDayLog(response.data);
				// Cache exercises
			}
		} catch (error) {
			console.error("Failed to fetch detailed day log:", error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!isAuthenticated) return;
		const dayLogId = Number(workout_day_log_id);
		fetchDetailedDayLog(dayLogId);
	}, [isAuthenticated, workout_day_log_id, workoutPlanRun]);
	const onCompleteDay = async () => {
		if (detailedDayLog?.item_logs.some(itemLog => !itemLog.completed)) {
			Alert.alert("Please complete all exercises before completing the day.");
			return;
		} 

		if (!detailedDayLog) return;
		setSaving(true);
		try {
			await api.patch(`/api/me/workout_day_log/${detailedDayLog.id}/`, { completed: true });
			setDetailedDayLog({ ...detailedDayLog, completed: true });
			await refreshWorkoutPlanRun();
			router.back();
		} catch (error) {
			console.error("Failed to complete workout day:", error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Day {detailedDayLog?.day_number ?? workout_day_log_id}</Text>
				<Text style={styles.subtitle}>{detailedDayLog?.description ?? "Workout details"}</Text>
				<Pressable
					onPress={saving || detailedDayLog?.completed ? undefined : onCompleteDay}
					style={({ pressed }) => [
						styles.completeButton,
						(saving || detailedDayLog?.completed) && styles.completeButtonDisabled,
						pressed && !(saving || detailedDayLog?.completed) && styles.completeButtonPressed,
					]}
				>
					<Text style={styles.completeButtonText}>
						{detailedDayLog?.completed ? "Day Completed" : saving ? "Saving…" : "Complete Day"}
					</Text>
				</Pressable>
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#1D4ED8" />
					<Text style={styles.loadingText}>Loading workout…</Text>
				</View>
			) : detailedDayLog ? (
				<FlatList
					data={detailedDayLog.item_logs}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.list}
					renderItem={({ item, index }) => {
						const exercise: Exercise = item.workout_item.exercise;
						const completed = item.completed;
						const prevCompleted = index === 0 ? true : detailedDayLog.item_logs[index - 1]?.completed;
						const status = completed ? "Done" : prevCompleted ? "Go!" : "Inactive";
						const isActive = status === "Go!";
						const sets = item.workout_item.sets;
						const amount = item.workout_item.amount;
						const unit = exercise?.amount_unit ? ` ${exercise.amount_unit}` : "";

						return (
							<View style={styles.card}>
								<View style={styles.thumbnailWrap}>
									{exercise?.thumbnail ? (
										<Image source={{ uri: getMediaUrl(exercise.thumbnail) }} style={styles.thumbnail} />
									) : (
										<View style={styles.thumbnailPlaceholder} />
									)}
								</View>

								<View style={styles.textColumn}>
									<Text style={styles.name} numberOfLines={1}>
										{exercise?.name ?? "Exercise"}
									</Text>
									{exercise?.difficulty_level?.name || exercise?.exercise_type?.name ? (
										<Text style={styles.meta} numberOfLines={1}>
											{exercise?.difficulty_level?.name ?? ""}
											{exercise?.difficulty_level?.name && exercise?.exercise_type?.name ? "  •  " : ""}
											{exercise?.exercise_type?.name ?? ""}
										</Text>
									) : null}
									<Text style={styles.details} numberOfLines={1}>
										{`${sets} sets  •  ${amount}${unit}`}
									</Text>
								</View>

								<Pressable
									onPress={() => {
										if (!isActive) return;
										router.push({
											pathname: "/(protected)/current_workout/exercise/[workout_item_log_id]",
											params: { workout_item_log_id: String(item.id) },
										});
									}}
									style={({ pressed }) => [
										styles.statusButton,
										completed && styles.statusDone,
										isActive && styles.statusGo,
										!isActive && !completed && styles.statusInactive,
										pressed && isActive && styles.statusPressed,
									]}
								>
									<Text
										style={[
											styles.statusText,
											completed && styles.statusTextDone,
											!isActive && !completed && styles.statusTextInactive,
										]}
									>
										{status}
									</Text>
								</Pressable>
							</View>
						);
					}}
				/>
			) : (
				<View style={styles.center}>
					<Text style={styles.emptyTitle}>No data available</Text>
					<Text style={styles.emptySubtitle}>Please go back and try again.</Text>
				</View>
			)}
		</SafeAreaView>
	);

	// useEffect(() => {


	// }, [dayExercises]);

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
	completeButton: {
		marginTop: 10,
		alignSelf: "flex-start",
		backgroundColor: "#1D4ED8",
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 10,
	},
	completeButtonPressed: {
		transform: [{ scale: 0.98 }],
	},
	completeButtonDisabled: {
		backgroundColor: "#94A3B8",
	},
	completeButtonText: {
		color: "#FFFFFF",
		fontWeight: "700",
		fontSize: 13,
	},
	list: {
		gap: 10,
		paddingBottom: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 12,
		padding: 10,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	thumbnailWrap: {
		width: 64,
		height: 64,
		borderRadius: 12,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "#ccc",
		backgroundColor: "#fff",
	},
	thumbnail: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	thumbnailPlaceholder: {
		flex: 1,
		backgroundColor: "#eee",
	},
	textColumn: {
		flex: 1,
		justifyContent: "center",
		gap: 2,
	},
	name: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 4,
	},
	meta: {
		fontSize: 12,
		color: "#64748B",
	},
	details: {
		fontSize: 12,
		color: "#334155",
	},
	statusButton: {
		paddingHorizontal: 12,
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
		fontSize: 12,
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
	loadingText: {
		color: "#64748B",
		fontSize: 14,
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
});
