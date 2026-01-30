import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, View, Platform, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/src/config/env";
import { validateRegister } from "@/src/validation/auth";
import { AppButton } from "@/src/components/AppButton";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateRegister({
      username,
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
    });

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/register/`, {
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      });
      setSuccessMessage("Account created. Redirecting…");
      setTimeout(() => router.replace("/(auth)/login"), 900);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        const msg =
          data?.detail ??
          data?.non_field_errors?.[0] ??
          data?.username?.[0] ??
          data?.email?.[0] ??
          data?.first_name?.[0] ??
          data?.last_name?.[0] ??
          data?.firstName?.[0] ??
          data?.lastName?.[0] ??
          data?.name?.[0] ??
          data?.surname?.[0] ??
          data?.password?.[0];

        setErrorMessage(msg ?? "Rejestracja nieudana.");
        return;
      }

      setErrorMessage("Rejestracja nieudana.");
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
            <Text style={styles.title}>Rejestracja</Text>
            <Text style={styles.subtitle}>Załóż konto i zacznij trenować</Text>
          </View>

          <View style={styles.card}>
            {errorMessage || successMessage ? (
              <View
                style={[
                  styles.messageCard,
                  errorMessage ? styles.messageCardError : styles.messageCardSuccess,
                ]}
              >
                {errorMessage ? <Text style={styles.messageTextError}>{errorMessage}</Text> : null}
                {successMessage ? <Text style={styles.messageTextSuccess}>{successMessage}</Text> : null}
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
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Imię</Text>
              <TextInput
                style={styles.input}
                placeholder="Imię"
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
                autoCorrect={false}
                textContentType="givenName"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nazwisko</Text>
              <TextInput
                style={styles.input}
                placeholder="Nazwisko"
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
                autoCorrect={false}
                textContentType="familyName"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Powtórz hasło</Text>
              <TextInput
                style={styles.input}
                placeholder="Powtórz hasło"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
            </View>

            <AppButton title="Utwórz konto" onPress={onRegister} style={styles.primaryAction} />
          </View>

          <AppButton
            variant="link"
            title="Masz już konto? Zaloguj się"
            onPress={() => router.push("/login")}
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
  messageCardSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
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
  primaryAction: {
    marginTop: 4,
    width: "100%",
  },
  messageTextError: {
    color: "#991B1B",
    fontWeight: "700",
    textAlign: "left",
    lineHeight: 18,
  },
  messageTextSuccess: {
    color: "#166534",
    fontWeight: "700",
    textAlign: "left",
    lineHeight: 18,
  },
  linkButton: {
    marginTop: 14,
    alignSelf: "center",
  },
});
