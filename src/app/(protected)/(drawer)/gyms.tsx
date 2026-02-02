import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Linking,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";

import { Ionicons } from "@expo/vector-icons";

import { api } from "@/src/config/api";

type Equipment = {
	id: number;
	name: string;
};

type GymAddress = {
	id: number;
	street: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	latitude: string;
	longitude: string;
};

type Gym = {
	id: number;
	name: string;
	address: GymAddress;
	equipments: Equipment[];
	contact_email?: string | null;
	contact_phone?: string | null;
};

function getGoogleMapsUrl(address: GymAddress) {
	const lat = Number.parseFloat(address.latitude);
	const lng = Number.parseFloat(address.longitude);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function parseIdList(value?: string | string[]) {
	if (!value) return [] as number[];
	const values = Array.isArray(value) ? value : value.split(",");
	return values
		.map((item) => Number.parseInt(item, 10))
		.filter((item) => Number.isFinite(item));
}

export default function GymsScreen() {
	const params = useLocalSearchParams<{
		equipmentIds?: string | string[];
		equipment_ids?: string | string[];
	}>();

	const initialSelected = useMemo(() => {
		const merged = [
			...parseIdList(params.equipmentIds),
			...parseIdList(params.equipment_ids),
		];
		return Array.from(new Set(merged));
	}, [params.equipmentIds, params.equipment_ids]);

	const [filtersOpen, setFiltersOpen] = useState(true);
	const [equipments, setEquipments] = useState<Equipment[]>([]);
	const [gyms, setGyms] = useState<Gym[]>([]);
	const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(initialSelected);
	const [loading, setLoading] = useState(true);
	const [loadingEquipments, setLoadingEquipments] = useState(true);

	useEffect(() => {
		if (initialSelected.length === 0) return;
		setSelectedEquipmentIds(initialSelected);
	}, [initialSelected]);

	useEffect(() => {
		let cancelled = false;

		const fetchEquipments = async () => {
			try {
				setLoadingEquipments(true);
				const res = await api.get<Equipment[]>("/api/equipments/");
				if (!cancelled) setEquipments(res.data);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					console.log("[equipments] status:", err.response?.status);
					console.log("[equipments] data:", err.response?.data);
				} else {
					console.log("[equipments] error:", err);
				}
			} finally {
				if (!cancelled) setLoadingEquipments(false);
			}
		};

		const fetchGyms = async () => {
			try {
				setLoading(true);
				const res = await api.get<Gym[]>("/api/gyms/");
				if (!cancelled) setGyms(res.data);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					console.log("[gyms] status:", err.response?.status);
					console.log("[gyms] data:", err.response?.data);
				} else {
					console.log("[gyms] error:", err);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchEquipments();
		fetchGyms();

		return () => {
			cancelled = true;
		};
	}, []);

	const filteredGyms = useMemo(() => {
		if (selectedEquipmentIds.length === 0) return gyms;
		return gyms.filter((gym) =>
			selectedEquipmentIds.every((id) => gym.equipments?.some((eq) => eq.id === id))
		);
	}, [gyms, selectedEquipmentIds]);

	const toggleEquipment = (id: number) => {
		setSelectedEquipmentIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Gyms</Text>

			<View style={styles.filterCard}>
				<Pressable
					onPress={() => setFiltersOpen((open) => !open)}
					style={({ pressed }) => [styles.filterHeader, pressed && styles.cardPressed]}
				>
					<Text style={styles.filterTitle}>Filter by equipment</Text>
					<Text style={styles.filterCount}>
						{selectedEquipmentIds.length} selected
					</Text>
				</Pressable>

				{filtersOpen ? (
					loadingEquipments ? (
						<ActivityIndicator size="small" color="#1D4ED8" style={styles.filterLoader} />
					) : (
						<View style={styles.chipWrap}>
							{equipments.map((equipment) => {
								const isSelected = selectedEquipmentIds.includes(equipment.id);
								return (
									<Pressable
										key={equipment.id}
										onPress={() => toggleEquipment(equipment.id)}
										style={({ pressed }) => [
											styles.chip,
											isSelected && styles.chipSelected,
											pressed && styles.cardPressed,
										]}
									>
										<Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
											{equipment.name}
										</Text>
									</Pressable>
								);
							})}
						</View>
					)
				) : null}
			</View>

			{loading ? (
				<ActivityIndicator size="large" color="#1D4ED8" />
			) : (
				<FlatList
					data={filteredGyms}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardRow}>
								<View style={styles.infoColumn}>
									<Text style={styles.gymName} numberOfLines={1}>
										{item.name}
									</Text>
									<Text style={styles.address} numberOfLines={2}>
										{item.address.street}, {item.address.postal_code} {item.address.city}
									</Text>
									{item.contact_email ? (
										<Text style={styles.contact}>{item.contact_email}</Text>
									) : null}
									{item.contact_phone ? (
										<Text style={styles.contact}>{item.contact_phone}</Text>
									) : null}
								</View>
								{getGoogleMapsUrl(item.address) ? (
									<Pressable
										onPress={() => {
											const url = getGoogleMapsUrl(item.address);
											if (url) Linking.openURL(url);
										}}
										style={({ pressed }) => [styles.mapButton, pressed && styles.cardPressed]}
									>
										<Ionicons name="location-outline" size={24} color="#1D4ED8" />
									</Pressable>
								) : null}
							</View>
						</View>
					)}
					ListEmptyComponent={
						<Text style={styles.emptyText}>No gyms match the selected equipment.</Text>
					}
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
		padding: 12,
		gap: 6,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	cardRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	infoColumn: {
		flex: 1,
		gap: 6,
	},
	cardPressed: {
		opacity: 0.9,
	},
	filterCard: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 12,
		padding: 10,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 2,
	},
	filterHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	filterTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: "#111",
	},
	filterCount: {
		fontSize: 13,
		color: "#555",
	},
	filterLoader: {
		marginTop: 10,
	},
	chipWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 10,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#cbd5f5",
		backgroundColor: "#f8faff",
	},
	chipSelected: {
		backgroundColor: "#1D4ED8",
		borderColor: "#1D4ED8",
	},
	chipText: {
		fontSize: 12,
		color: "#1f2937",
		fontWeight: "600",
	},
	chipTextSelected: {
		color: "#fff",
	},
	gymName: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111",
	},
	address: {
		fontSize: 13,
		color: "#444",
	},
	equipmentText: {
		fontSize: 12,
		color: "#1f2937",
	},
	equipmentEmpty: {
		fontSize: 12,
		color: "#9ca3af",
	},
	contact: {
		fontSize: 12,
		color: "#6b7280",
	},
	mapButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#eff4ff",
		borderWidth: 1,
		borderColor: "#c7d2fe",
	},
	mapButtonText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#1D4ED8",
	},
	mapIcon: {
		fontSize: 14,
		color: "#1D4ED8",
		fontWeight: "700",
	},
	emptyText: {
		textAlign: "center",
		marginTop: 24,
		color: "#6b7280",
	},
});
