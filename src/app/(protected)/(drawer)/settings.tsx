import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { AppOptionsItem } from "@/src/components/OptionsItem";
import { useFocusEffect } from "@react-navigation/native";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function Settings() {
  const { logout, isAuthActionLoading, userData } = useAuth();
  const copy = useCopy();
  const router = useRouter();
  const onLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  useFocusEffect(() => {
    if (userData?.subscription_plan === null) {
      router.replace("/(protected)/(onboarding)/choose_subscription");
    }
  });

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>{copy("drawer_settings_title")}</Text>
        <Text style={mainStyles.subtitle}>{copy("drawer_settings_subtitle")}</Text>
      </View>

      <View style={[mainStyles.card, { padding: 0, marginTop: 12 }]}>
        <AppOptionsItem
          title={copy("drawer_settings_option_verify_title")}
          subtitle={copy("drawer_settings_option_verify_subtitle")}
          iconName="shield-checkmark-outline"
          onPress={() => router.push("/(protected)/(onboarding)/verify_account")}
        />

        <View style={styles.divider} />

        <AppOptionsItem
          title={copy("drawer_settings_option_subscription_title")}
          subtitle={copy("drawer_settings_option_subscription_subtitle")}
          iconName="card-outline"
          onPress={() => router.push("/(protected)/(onboarding)/choose_subscription")}
        />

        <View style={styles.divider} />

        <AppOptionsItem
          title={copy("drawer_settings_option_workout_title")}
          subtitle={copy("drawer_settings_option_workout_subtitle")}
          iconName="barbell-outline"
          onPress={() => router.push("/(protected)/(onboarding)/choose_workout_plan")}
        />

        <View style={styles.divider} />
        <AppOptionsItem
          title={copy("drawer_settings_option_bug_title")}
          subtitle={copy("drawer_settings_option_bug_subtitle")}
          iconName="bug-outline"
          onPress={() => router.push("/(protected)/(additional)/bug_report")}
        />

        <View style={styles.divider} />

        <AppOptionsItem
          title={copy("drawer_settings_option_feature_title")}
          subtitle={copy("drawer_settings_option_feature_subtitle")}
          iconName="create-outline"
          onPress={() => router.push("/(protected)/(additional)/new_feature_request")}
        />
      </View>

      <View style={[mainStyles.card, { padding: 0, marginTop: 12 }]}>
        <Pressable
          onPress={onLogout}
          disabled={isAuthActionLoading}
          style={({ pressed }) => [
            styles.row,
            pressed && styles.rowPressed,
            isAuthActionLoading && styles.rowDisabled,
          ]}
        >
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitleDanger}>
                {isAuthActionLoading
                  ? copy("drawer_settings_logout_loading")
                  : copy("drawer_settings_logout")}
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
  rowTitleDanger: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#BFDBFE",
  },
});
