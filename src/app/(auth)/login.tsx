import { Text, TextInput, StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import axios from "axios";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { validateLogin } from "@/src/validation/auth";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
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

        setErrorMessage(msg ?? "Login failed. Check your username and password.");
        return;
      }

      setErrorMessage("Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={mainStyles.header}>
            <Text style={mainStyles.title}>Login</Text>
            <Text style={mainStyles.subtitle}>Log in to continue</Text>
          </View>

          <View style={mainStyles.card}>
            {errorMessage ? (
              <View style={[mainStyles.messageCard, mainStyles.messageCardError]}>
                <Text style={mainStyles.messageTextError}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>Username</Text>
              <TextInput
                style={mainStyles.input}
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

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>Password</Text>
              <TextInput
                style={mainStyles.input}
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
              title={isAuthActionLoading ? "Logging in…" : "Log in"}
              style={styles.primaryAction}
            />
          </View>

          <AppButton
            variant="link"
            onPress={() => router.push("/register")}
            title="No account? Sign up!"
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
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