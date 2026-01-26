import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/src/components/AppButton";

export default function Start() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nerd Gym Bros</Text>
        <Text style={styles.subtitle}>Zaloguj się lub załóż konto, aby kontynuować.</Text>

        <View style={styles.actions}>
          <AppButton
            title="Zaloguj"
            onPress={() => router.push("/login")}
            style={styles.actionButton}
          />

          <AppButton
            title="Zarejestruj"
            onPress={() => router.push("/register")}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
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
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
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
