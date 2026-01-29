import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

import { api } from "@/src/config/api";
import type { Exercise } from "@/src/types/workoutPlan";
import { setExercises } from "@/src/cache/exercises";
import { API_BASE_URL } from "@/src/config/env";

function getMediaUrl(pathOrUrl: string) {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
	return `${API_BASE_URL}/${pathOrUrl}`;
}

export default function AllExercises() {
	const [items, setItems] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;

		const fetchExercises = async () => {
			try {
				setLoading(true);
				const res = await api.get<Exercise[]>("/api/exercises");
				setExercises(res.data);
				if (!cancelled) setItems(res.data);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					console.log("[exercises] status:", err.response?.status);
					console.log("[exercises] data:", err.response?.data);
				} else {
					console.log("[exercises] error:", err);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchExercises();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Exercises</Text>

			{loading ? (
				<ActivityIndicator />
			) : (
				<FlatList
					data={items}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<Pressable
							onPress={() =>
								router.push({
									pathname: "/(protected)/(drawer)/all_exercises/[exerciseId]",
									params: { exerciseId: String(item.id) },
								})
							}
							style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
						>
							<View style={styles.thumbnailWrap}>
								{item.thumbnail ? (
									<Image source={{ uri: getMediaUrl(item.thumbnail) }} style={styles.thumbnail} />
								) : (
									<View style={styles.thumbnailPlaceholder} />
								)}
							</View>

							<View style={styles.textColumn}>
								<Text style={styles.name} numberOfLines={1}>
									{item.name}
								</Text>
								{item.difficulty_level?.name || item.exercise_type?.name ? (
									<Text style={styles.meta} numberOfLines={1}>
										{item.difficulty_level?.name ? item.difficulty_level.name : ""}
										{item.difficulty_level?.name && item.exercise_type?.name ? "  •  " : ""}
										{item.exercise_type?.name ? item.exercise_type.name : ""}
									</Text>
								) : null}
							</View>
						</Pressable>
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		marginBottom: 12,
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
	cardPressed: {
		opacity: 0.9,
	},
	thumbnailWrap: {
		width: 72,
		height: 72,
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
	},
	name: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 4,
	},
	meta: {
		fontSize: 13,
		color: "#444",
	},
});
