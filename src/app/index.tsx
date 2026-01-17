import { Text, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Start() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nerd Gym Bros</Text>
        <Text style={styles.subtitle}>Zaloguj się lub załóż konto, aby kontynuować.</Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/login")}>
            <Text style={styles.primaryButtonText}>Zaloguj</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push("/register")}>
            <Text style={styles.secondaryButtonText}>Zarejestruj</Text>
          </Pressable>
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
  primaryButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderColor: "#007BFF",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
  },
  secondaryButtonText: {
    color: "#007BFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
