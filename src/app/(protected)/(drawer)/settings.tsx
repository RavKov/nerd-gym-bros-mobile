import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { AppOptionsItem } from "@/src/components/OptionsItem";

export default function Settings() {
	const { logout, isAuthActionLoading } = useAuth();

	const onLogout = async () => {
		await logout();
		router.replace("/login");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Settings</Text>
				<Text style={styles.subtitle}>Manage your account and plans</Text>
			</View>

			<View style={styles.card}>
				<AppOptionsItem title="Verify account" subtitle="Email verification & resend" iconName="shield-checkmark-outline" onPress={() => router.push("/(protected)/(onboarding)/verify_account")} />

				<View style={styles.divider} />

				<AppOptionsItem 
					title="Subscription" 
					subtitle="Choose or change your plan" 
					iconName="card-outline" 
					onPress={() => router.push("/(protected)/(onboarding)/choose_subscription")} />

				<View style={styles.divider} />

				<AppOptionsItem 
					title="Workout plan" 
					subtitle="Switch your training program" 
					iconName="barbell-outline" 
					onPress={() => router.push("/(protected)/(onboarding)/choose_workout_plan")} />


				<View style={styles.divider} />
				<AppOptionsItem 
					title="Report a bug" 
					subtitle="Send feedback with a screenshot" 
					iconName="bug-outline" 
					onPress={() => router.push("/(protected)/(additional)/bug_report")} />

				
				<View style={styles.divider} />


				<AppOptionsItem 
					title="Request a new feature" 
					subtitle="Suggest an improvement" 
					iconName="create-outline" 
					onPress={() => router.push("/(protected)/(additional)/new_feature_request")} />

			</View>

			<View style={styles.card}>
				<Pressable
					onPress={onLogout}
					disabled={isAuthActionLoading}
					style={({ pressed }) => [styles.row, pressed && styles.rowPressed, isAuthActionLoading && styles.rowDisabled]}
				>
					<View style={styles.rowLeft}>
						<View style={styles.iconWrap}>
							<Ionicons name="log-out-outline" size={20} color="#DC2626" />
						</View>
						<View style={styles.rowTextWrap}>
							<Text style={styles.rowTitleDanger}>
								{isAuthActionLoading ? "Wylogowywanie…" : "Logout"}
							</Text>
						</View>
					</View>
				</Pressable>
			</View>
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
	card: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#BFDBFE",
		borderRadius: 12,
		overflow: "hidden",
		marginTop: 12,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowPressed: {
		backgroundColor: "#EFF6FF",
	},
	rowDisabled: {
		opacity: 0.6,
	},
	rowLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	iconWrap: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#EFF6FF",
	},
	rowTextWrap: {
		flex: 1,
		gap: 2,
	},
	rowTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#0F172A",
	},
	rowTitleDanger: {
		fontSize: 16,
		fontWeight: "700",
		color: "#DC2626",
	},
	rowSubtitle: {
		fontSize: 13,
		color: "#475569",
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "#BFDBFE",
	},
});
