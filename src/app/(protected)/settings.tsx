import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { AppButton } from "@/src/components/AppButton";

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

				<AppButton
					onPress={onLogout}
					disabled={isAuthActionLoading}
					title={isAuthActionLoading ? "Wylogowywanie…" : "Logout"}
					style={styles.primaryAction}
				/>
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
	primaryAction: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		width: "100%",
		maxWidth: 420,
	},
});
