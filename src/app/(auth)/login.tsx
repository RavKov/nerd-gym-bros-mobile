import {
  Text,
  TextInput,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import axios from "axios";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { validateLogin } from "@/src/validation/auth";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function Login() {
  const { login, isAuthActionLoading } = useAuth();
  const copy = useCopy();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async () => {
    try {
      setErrorMessage(null);

      const validationError = validateLogin(username, password);
      if (validationError) {
        setErrorMessage(copy(validationError));
        return;
      }
      await login(username, password);
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data: any = error.response?.data;
        const msg =
          data?.detail ?? data?.non_field_errors?.[0] ?? data?.username?.[0] ?? data?.password?.[0];

        setErrorMessage(msg ?? copy("auth_login_error_invalid"));
        return;
      }

      setErrorMessage(copy("auth_login_error_generic"));
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
            <Text style={mainStyles.title}>{copy("auth_login_title")}</Text>
            <Text style={mainStyles.subtitle}>{copy("auth_login_subtitle")}</Text>
          </View>

          <View style={mainStyles.card}>
            {errorMessage ? (
              <View style={[mainStyles.messageCard, mainStyles.messageCardError]}>
                <Text style={mainStyles.messageTextError}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={mainStyles.labelInputContainer}>
              <Text style={mainStyles.label}>{copy("auth_login_username")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={copy("auth_login_username_placeholder")}
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
              <Text style={mainStyles.label}>{copy("auth_login_password")}</Text>
              <TextInput
                style={mainStyles.input}
                placeholder={copy("auth_login_password_placeholder")}
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
              title={
                isAuthActionLoading ? copy("auth_login_button_loading") : copy("auth_login_button")
              }
              style={styles.primaryAction}
            />
          </View>

          <AppButton
            variant="link"
            onPress={() => router.push("/register")}
            title={copy("auth_login_link_signup")}
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
