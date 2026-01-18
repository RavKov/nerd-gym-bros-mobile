import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";

import { API_BASE_URL } from "@/src/config/env";
import { validateRegister } from "@/src/validation/auth";

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

      setSuccessMessage("Konto utworzone. Możesz się zalogować.");
    //   router.replace("/login");
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
     keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}

      style={{ flex: 1 }}
    >
          <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Surname</Text>
      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable style={styles.button} onPress={onRegister}>
        <Text style={styles.buttonText}>Create account</Text>
      </Pressable>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <Pressable style={styles.linkButton} onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Mam konto — zaloguj</Text>
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '80%',
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginLeft: "10%",
    marginBottom: 4,
  },
  error: {
    marginTop: 10,
    color: "red",
    fontWeight: "bold",
  },
  success: {
    marginTop: 10,
    color: "green",
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 14,
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
