import { View, Text, TextInput, Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";
import { api } from "@/src/config/api";
import axios from "axios";
import { RefreshControl } from "react-native-gesture-handler";
import { AppButton } from "@/src/components/AppButton";
import { mainStyles } from "@/src/styles/mainStyles";
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
      Alert.alert("No data", "No user email found.");
      return;
    }
    if (value.length !== 6) {
      Alert.alert("Invalid code", "Verification code must be 6 digits.");
      return;
    }

    try {
      await api.post('/api/me/verify/', { code: value, email: userData.user.email })
      Alert.alert("Success", "Account has been successfully verified.");
      await refreshUserData();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("[verify] status:", error.response?.status);
        console.log("[verify] data:", error.response?.data);
        Alert.alert("Verification error", String(error.response?.data?.detail ?? error.message));
        return;
      }
      console.error("Failed to verify account:", error);
    }
  }

  const onResend = async () => {
    if (!userData?.user?.email) {
      Alert.alert("No data", "No user email found.");
      return;
    }
    try {
      await api.post('/api/me/resend_verification/', { email: userData.user.email })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("[resend] status:", error.response?.status);
        console.log("[resend] data:", error.response?.data);
        Alert.alert("Error", String(error.response?.data?.detail ?? error.message));
        return;
      }
      console.error("Failed to resend verification code:", error);
    }
  }

  return (
    <SafeAreaView
      style={mainStyles.container}
    >
      <View style={mainStyles.contentCenter}>

        {userData?.verified ? (
          <View style={[mainStyles.messageCard, mainStyles.messageCardSuccess]}>
            <Text style={[mainStyles.messageTextSuccess, { fontSize: 18 }]}>
              Your account is already verified.
            </Text>
          </View>
        ) : (
          <>
            <View style={mainStyles.header}>
              <Text style={mainStyles.title}>Account Verification</Text>
              <Text style={mainStyles.subtitle}>Type in verification code that was sent to your email: {userData?.user?.email ?? ""}</Text>
            </View>

            <TextInput
              value={value}
              onChangeText={handleChange}
              keyboardType="numeric"
              maxLength={6}
              style={[mainStyles.input, { textAlign: "center", fontSize: 18, letterSpacing: 12, minWidth: "80%" }]}
            />

            <AppButton title="Verify account" onPress={onVerify} style={{ marginTop: 20 }} />

            <AppButton
              title="Resend code"
              onPress={onResend}
              variant="link"
              style={{ marginTop: 15 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}