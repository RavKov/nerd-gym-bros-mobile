import { Text, TextInput, StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import axios from "axios";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { validateLogin } from "@/src/validation/auth";
import { AppButton } from "@/src/components/AppButton";

export default function Login() {
  const { login, isAuthActionLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async () => {
    try {
      setErrorMessage(null);

      const validationError = validateLogin(username, password);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
      await login(username, password);
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      console.log("Login failed:", error);

      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        const msg =
          data?.detail ??
          data?.non_field_errors?.[0] ??
          data?.username?.[0] ??
          data?.password?.[0];

        setErrorMessage(msg ?? "Nie udało się zalogować. Sprawdź login i hasło.");
        return;
      }

      setErrorMessage("Nie udało się zalogować. Spróbuj ponownie.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Logowanie</Text>
            <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>
          </View>

          <View style={styles.card}>
            {errorMessage ? (
              <View style={[styles.messageCard, styles.messageCardError]}>
                <Text style={styles.messageTextError}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Nazwa użytkownika</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
              />
            </View>

            <AppButton
              onPress={onLogin}
              disabled={isAuthActionLoading}
              title={isAuthActionLoading ? "Logowanie…" : "Zaloguj"}
              style={styles.primaryAction}
            />
          </View>

          <AppButton
            variant="link"
            onPress={() => router.push("/register")}
            title="Nie masz konta? Zarejestruj się"
            style={styles.linkButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 4,
    marginBottom: 8,
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
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    color: "#0F172A",
  },
  messageCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  messageCardError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#ff9393",
  },
  messageTextError: {
    color: "#991B1B",
    fontWeight: "700",
    lineHeight: 18,
  },
  primaryAction: {
    marginTop: 4,
    width: "100%",
  },
  linkButton: {
    marginTop: 14,
    alignSelf: "center",
  },
});