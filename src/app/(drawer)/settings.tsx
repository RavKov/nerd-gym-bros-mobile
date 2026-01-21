import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";

export default function Settings() {
	const { logout, isAuthActionLoading } = useAuth();

	const onLogout = async () => {
		await logout();
		router.replace("/login");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Settings</Text>

				<Pressable style={[styles.buttonDanger, isAuthActionLoading && styles.buttonDisabled]} onPress={onLogout} disabled={isAuthActionLoading}>
					<Text style={styles.buttonText}>{isAuthActionLoading ? "Wylogowywanie…" : "Logout"}</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	content: {
		flex: 1,
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 16,
	},
	buttonDanger: {
		backgroundColor: "#007BFF",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		width: "100%",
		maxWidth: 420,
	},
	buttonText: {
		color: "#FFFFFF",
		textAlign: "center",
		fontSize: 16,
		fontWeight: "700",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
});
