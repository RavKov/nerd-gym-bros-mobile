import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { registerUser } from "@/src/api/auth";
import { validateRegister } from "@/src/validation/auth";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { useContent } from "@/src/context/ContentContext";

export default function Register() {
  const router = useRouter();
  const { t } = useContent();

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
      setErrorMessage(t(validationError, validationError));
      return;
    }

    try {
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      });
      setSuccessMessage(t("auth_register_success", "Account created. Redirecting…"));
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

        setErrorMessage(msg ?? t("auth_register_error", "Registration failed."));
        return;
      }

      setErrorMessage(t("auth_register_error", "Registration failed."));
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
            <Text style={mainStyles.title}>{t("auth_register_title", "Registration")}</Text>
            <Text style={mainStyles.subtitle}>
              {t("auth_register_subtitle", "Create an account and start training")}
            </Text>
          </View>

          <View style={mainStyles.card}>
            {errorMessage || successMessage ? (
              <View
                style={[
                  mainStyles.messageCard,
                  errorMessage ? mainStyles.messageCardError : mainStyles.messageCardSuccess,
                ]}
              >
                {errorMessage ? (
                  <Text style={mainStyles.messageTextError}>{errorMessage}</Text>
                ) : null}
                {successMessage ? (
                  <Text style={mainStyles.messageTextSuccess}>{successMessage}</Text>
                ) : null}
              </View>
            ) : null}

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{t("auth_register_username", "Username")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_username_placeholder", "Username")}
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
              />
            </View>

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{t("auth_register_email", "Email")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_email_placeholder", "name@example.com")}
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{t("auth_register_first_name", "First Name")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_first_name_placeholder", "First Name")}
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
                autoCorrect={false}
                textContentType="givenName"
              />
            </View>

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{t("auth_register_last_name", "Last Name")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_last_name_placeholder", "Last Name")}
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
                autoCorrect={false}
                textContentType="familyName"
              />
            </View>

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{t("auth_register_password", "Password")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_password_placeholder", "Password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
            </View>

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>
                {t("auth_register_confirm_password", "Confirm Password")}
              </Text>
              <TextInput
                style={mainStyles.input}
                placeholder={t("auth_register_confirm_password_placeholder", "Confirm Password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
            </View>

            <AppButton
              title={t("auth_register_button", "Create Account")}
              onPress={onRegister}
              style={styles.primaryAction}
            />
          </View>

          <AppButton
            variant="link"
            title={t("auth_register_link_login", "Already have an account? Log in")}
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
