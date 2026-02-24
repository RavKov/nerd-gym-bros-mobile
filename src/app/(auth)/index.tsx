import { Text, StyleSheet, View, Image } from "react-native";
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

        <View style={styles.hero}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={mainStyles.largeTitle}>{t("auth_index_title", "Nerd Gym Bros")}</Text>
          <Text style={mainStyles.subtitle}>{t("auth_index_tagline", "Train smarter! Gain more!")}</Text>
          <Text style={styles.encouragingText}>
            {t("auth_index_encouragement", "Track your progress, follow your training plans, and build the best version of yourself — step by step.")}
          </Text>
        </View>

        <View style={mainStyles.card}>
          <Text style={[mainStyles.label, {fontSize: 16, marginBottom: 8}]}>{t("auth_index_coming_back", "Coming back?")}</Text>
          <AppButton
            title={t("auth_index_login_button", "Log in")}
            onPress={() => router.push("/login")}
          />
          <View style={styles.divider} />
          <Text style={[mainStyles.label, {fontSize: 16, marginBottom: 8}]}>{t("auth_index_first_time", "First time?")}</Text>
          <AppButton
            title={t("auth_index_signup_button", "Sign up")}
            onPress={() => router.push("/register")}
            variant="secondary"
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 32,
    paddingVertical: 16,
  },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  encouragingText: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#BFDBFE",
    marginVertical: 16,
  },
});
