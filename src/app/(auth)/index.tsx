import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { useContent } from "@/src/context/ContentContext";

export default function Start() {
  const { t } = useContent();

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={styles.content}>
        <View style={mainStyles.header}>
          <Text style={mainStyles.largeTitle}>{t("auth_index_title", "Nerd Gym Bros")}</Text>
          <Text style={mainStyles.subtitle}>{t("auth_index_subtitle", "Log in or create an account to continue.")}</Text>
        </View>

        <View style={mainStyles.card}>
          <View style={styles.actions}>
            <AppButton
              title={t("auth_index_login_button", "Log in")}
              onPress={() => router.push("/login")}
              style={styles.actionButton}
            />

            <AppButton
              title={t("auth_index_signup_button", "Sign up")}
              onPress={() => router.push("/register")}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  actions: {
    gap: 12,
    width: "100%",
    maxWidth: 420,
  },
  actionButton: {
    width: "100%",
  },
});
