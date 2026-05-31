import { Text, StyleSheet, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function Start() {
  const copy = useCopy();

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={mainStyles.largeTitle}>{copy("auth_index_title")}</Text>
          <Text style={mainStyles.subtitle}>{copy("auth_index_tagline")}</Text>
          <Text style={styles.encouragingText}>{copy("auth_index_encouragement")}</Text>
        </View>

        <View style={mainStyles.card}>
          <Text style={[mainStyles.label, { fontSize: 16, marginBottom: 8 }]}>
            {copy("auth_index_coming_back")}
          </Text>
          <AppButton
            title={copy("auth_index_login_button")}
            onPress={() => router.push("/login")}
          />
          <View style={styles.divider} />
          <Text style={[mainStyles.label, { fontSize: 16, marginBottom: 8 }]}>
            {copy("auth_index_first_time")}
          </Text>
          <AppButton
            title={copy("auth_index_signup_button")}
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
