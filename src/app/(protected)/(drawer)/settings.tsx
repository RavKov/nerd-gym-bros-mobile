import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { useContent } from "@/src/context/ContentContext";
import { Ionicons } from "@expo/vector-icons";
import { AppOptionsItem } from "@/src/components/OptionsItem";
import { useFocusEffect } from "@react-navigation/native";
import { mainStyles } from "@/src/styles/mainStyles";

export default function Settings() {
	const { logout, isAuthActionLoading, userData } = useAuth();
	const { t } = useContent();
	const router = useRouter();
	const onLogout = async () => {
		await logout();
		router.replace("/(auth)");
	};

	useFocusEffect(() => {
		// Ensure onboarding is complete
		if (userData?.subscription_plan === null) {
			router.replace("/(protected)/(onboarding)/choose_subscription");
		}
	});

	return (
		<SafeAreaView style={mainStyles.container}>
			<View style={mainStyles.header}>
				<Text style={mainStyles.title}>{t("drawer_settings_title", "Settings")}</Text>
				<Text style={mainStyles.subtitle}>{t("drawer_settings_subtitle", "Manage your account and plans")}</Text>
			</View>

			<View style={[mainStyles.card, { padding: 0, marginTop: 12 }]}>
				<AppOptionsItem 
					title={t("drawer_settings_option_verify_title", "Verify account")} 
					subtitle={t("drawer_settings_option_verify_subtitle", "Email verification & resend")} 
					iconName="shield-checkmark-outline" 
					onPress={() => router.push("/(protected)/(onboarding)/verify_account")} 
				/>

				<View style={styles.divider} />

				<AppOptionsItem
					title={t("drawer_settings_option_subscription_title", "Subscription")}
					subtitle={t("drawer_settings_option_subscription_subtitle", "Choose or change your plan")}
					iconName="card-outline"
					onPress={() => router.push("/(protected)/(onboarding)/choose_subscription")} />

				<View style={styles.divider} />

				<AppOptionsItem
					title={t("drawer_settings_option_workout_title", "Workout plan")}
					subtitle={t("drawer_settings_option_workout_subtitle", "Switch your training program")}
					iconName="barbell-outline"
					onPress={() => router.push("/(protected)/(onboarding)/choose_workout_plan")} />


				<View style={styles.divider} />
				<AppOptionsItem
					title={t("drawer_settings_option_bug_title", "Report a bug")}
					subtitle={t("drawer_settings_option_bug_subtitle", "Send feedback with a screenshot")}
					iconName="bug-outline"
					onPress={() => router.push("/(protected)/(additional)/bug_report")} />


				<View style={styles.divider} />


				<AppOptionsItem
					title={t("drawer_settings_option_feature_title", "Request a new feature")}
					subtitle={t("drawer_settings_option_feature_subtitle", "Suggest an improvement")}
					iconName="create-outline"
					onPress={() => router.push("/(protected)/(additional)/new_feature_request")} />

			</View>

			<View style={[mainStyles.card, { padding: 0, marginTop: 12 }]}>
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
								{isAuthActionLoading ? t("drawer_settings_logout_loading", "Wylogowywanie…") : t("drawer_settings_logout", "Logout")}
							</Text>
						</View>
					</View>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
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
