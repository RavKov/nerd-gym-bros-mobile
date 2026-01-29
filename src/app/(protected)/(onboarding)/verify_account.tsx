import { View, Text, TextInput, Alert } from "react-native";
import {useAuth} from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

import {useState} from "react";
import {api} from "@/src/config/api";
import axios from "axios";
import { RefreshControl } from "react-native-gesture-handler";
import { AppButton } from "@/src/components/AppButton";

export default function VerifyAccount() {
  const [value, setValue] = useState<string>('');   
  const { userData, setUserData, refreshUserData } = useAuth();
  const router = useRouter();

  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 6);
    setValue(digitsOnly);
  };


  const onVerify = async () => {
    if (!userData?.user?.email) {
      Alert.alert("Brak danych", "Nie znaleziono emaila użytkownika.");
      return;
    }
    if (value.length !== 6) {
      Alert.alert("Niepoprawny kod", "Kod weryfikacyjny musi mieć 6 cyfr.");
      return;
    }

    try {
      await api.post('/api/me/verify/', {code: value, email: userData.user.email})
      Alert.alert("Sukces", "Konto zostało pomyślnie zweryfikowane.");
      await refreshUserData();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("[verify] status:", error.response?.status);
        console.log("[verify] data:", error.response?.data);
        Alert.alert("Błąd weryfikacji", String(error.response?.data?.detail ?? error.message));
        return;
      }
      console.error("Failed to verify account:", error);
    }
  }
  
  const onResend = async () => {
    if (!userData?.user?.email) {
      Alert.alert("Brak danych", "Nie znaleziono emaila użytkownika.");
      return;
    }
    try {
      await api.post('/api/me/resend_verification/', {email: userData.user.email})
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("[resend] status:", error.response?.status);
        console.log("[resend] data:", error.response?.data);
        Alert.alert("Błąd", String(error.response?.data?.detail ?? error.message));
        return;
      }
      console.error("Failed to resend verification code:", error);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {userData?.verified ? (
        <Text style={{marginBottom: 10, textAlign: "center", fontSize: 22, fontWeight: "700", color: "green"}}>
          Your account is already verified.
        </Text>
      ) : (
        <>
          <Text style={{marginBottom: 10, textAlign: "center", fontSize: 18}}>
            Type in verification code that was sent to your email: { userData?.user?.email ?? ""}
          </Text>

      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={6}
        style={{
          height: 40,
          fontSize: 16,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 10,
          paddingHorizontal: 10,
          width: "80%",
          textAlign: "center",
        }}
      />

      <AppButton title="Verify account" onPress={onVerify} style={{ marginTop: 20 }} />

      <AppButton
        title="Resend code"
        onPress={onResend}
        variant="link"
        style={{ marginTop: 20 }}
      />
        </>
      )}
    </View>
  );
}