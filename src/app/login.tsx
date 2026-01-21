import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { validateLogin } from "@/src/validation/auth";

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
      console.log(`Attempting login with: ${username}, ${password}`);
      await login(username, password);
      router.replace("/(drawer)");
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

  const printTokens = async () => {
    const access = await SecureStore.getItemAsync("auth.access");
    const refresh = await SecureStore.getItemAsync("auth.refresh");
    console.log("Access Token:", access);
    console.log("Refresh Token:", refresh);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >   
        <Text style={styles.title}>Login Page</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        
        <Pressable style={[styles.button, isAuthActionLoading && styles.buttonDisabled]} onPress={onLogin} disabled={isAuthActionLoading}>
          <Text style={styles.buttonText}>{isAuthActionLoading ? "Logowanie…" : "Login"}</Text>
        </Pressable>


        {/* <Pressable style={styles.button} onPress={printTokens}>
          <Text style={styles.buttonText}>PrintTokens</Text>
        </Pressable> */}

        <Pressable style={styles.linkButton} onPress={() => router.push("/register")}>
          <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
        </Pressable>
    </View>
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
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginLeft: '10%',
    marginBottom: 4,
  },
  error: {
    marginTop: 10,
    color: "red",
  },
  linkButton: {

    marginTop: 15,
  },
  linkText: {
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});