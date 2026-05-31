import { View, Text, TextInput, Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";
import { resendVerification, verifyAccount } from "@/src/api/profile";
import { AppButton } from "@/src/components/AppButton";
import { alertAxiosError } from "@/src/utils/apiErrors";
import { mainStyles } from "@/src/styles/mainStyles";
import { useCopy } from "@/src/i18n/useCopy";

export default function VerifyAccount() {
  const [value, setValue] = useState<string>("");
  const { userData, refreshUserData } = useAuth();
  const copy = useCopy();
  const router = useRouter();

  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 6);
    setValue(digitsOnly);
  };

  const onVerify = async () => {
    if (!userData?.user?.email) {
      Alert.alert(
        copy("verify_account_alert_no_data_title"),
        copy("verify_account_alert_no_data_msg")
      );
      return;
    }
    if (value.length !== 6) {
      Alert.alert(
        copy("verify_account_alert_invalid_code_title"),
        copy("verify_account_alert_invalid_code_msg")
      );
      return;
    }

    try {
      await verifyAccount(userData.user.email, value);
      Alert.alert(
        copy("verify_account_alert_success_title"),
        copy("verify_account_alert_success_msg")
      );
      await refreshUserData();
      router.replace("/(protected)/(drawer)");
    } catch (error) {
      alertAxiosError(copy("verify_account_alert_error_title"), error);
    }
  };

  const onResend = async () => {
    if (!userData?.user?.email) {
      Alert.alert(
        copy("verify_account_alert_no_data_title"),
        copy("verify_account_alert_no_data_msg")
      );
      return;
    }
    try {
      await resendVerification(userData.user.email);
      Alert.alert(
        copy("verify_account_alert_success_title"),
        copy("verify_account_alert_resend_success_msg")
      );
    } catch (error) {
      alertAxiosError(copy("verify_account_alert_generic_error_title"), error);
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <View style={mainStyles.contentCenter}>
        {userData?.verified ? (
          <View style={[mainStyles.messageCard, mainStyles.messageCardSuccess]}>
            <Text style={[mainStyles.messageTextSuccess, { fontSize: 18 }]}>
              {copy("verify_account_already_verified")}
            </Text>
          </View>
        ) : (
          <>
            <View style={mainStyles.header}>
              <Text style={mainStyles.title}>{copy("verify_account_title")}</Text>
              <Text style={mainStyles.subtitle}>
                {copy("verify_account_subtitle", { email: userData?.user?.email ?? "" })}
              </Text>
            </View>

            <TextInput
              value={value}
              onChangeText={handleChange}
              keyboardType="numeric"
              maxLength={6}
              style={[
                mainStyles.input,
                { textAlign: "center", fontSize: 18, letterSpacing: 12, minWidth: "80%" },
              ]}
            />

            <AppButton
              title={copy("verify_account_button_verify")}
              onPress={onVerify}
              style={{ marginTop: 20 }}
            />

            <AppButton
              title={copy("verify_account_button_resend")}
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
