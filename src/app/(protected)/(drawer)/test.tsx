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


import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
} from "react-native-reanimated";
import { AppButton } from "@/src/components/AppButton";

export default function Test() {
	const params = useLocalSearchParams<{
		equipmentIds?: string | string[];
		equipment_ids?: string | string[];
	}>();

	const [filtersOpen, setFiltersOpen] = useState(true);
	const [loading, setLoading] = useState(true);
	const [loadingEquipments, setLoadingEquipments] = useState(true);



	return (
		<View style={styles.container}>
            <AppButton  title="Toggle Filters" onPress={() => setFiltersOpen((v) => !v)} />
            
            {filtersOpen ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={styles.filterCard}
            >
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
              </View>
            </Animated.View>
            ) : null}
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
		alignItems: "flex-start",
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
