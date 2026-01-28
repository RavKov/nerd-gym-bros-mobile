import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/src/components/AppButton";

export default function Start() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nerd Gym Bros</Text>
          <Text style={styles.subtitle}>Zaloguj się lub załóż konto, aby kontynuować.</Text>
        </View>

        <View style={styles.card}>
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
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
