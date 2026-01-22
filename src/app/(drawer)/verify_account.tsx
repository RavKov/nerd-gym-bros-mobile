import { View, Text, TextInput, Pressable } from "react-native";
import {useAuth} from "@/src/context/AuthContext";

import {useState} from "react";
import {api} from "@/src/config/api";

export default function VerifyAccount() {
  const [value, setValue] = useState<string>('');   
  const { userData, setUserData } = useAuth();
  const [verified, setVerified] = useState<boolean>(false);
  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 6);
    setValue(digitsOnly);
  };


  const onVerify = async () => {
    try {
      await api.post('/api/client/verify/', {code: value, email: userData.user.email})
      setVerified(true);
      
    } catch (error) {
      console.error("Failed to verify account:", error);
    }
  }
  const onResend = async () => {
    try {
      await api.post('/api/client/resend_verification/', {email: userData.user.email})
    } catch (error) {
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
      {verified && <Text style={{color: "green", marginBottom: 10}}>Account verified successfully!</Text>}

      <Text style={{marginBottom: 10, textAlign: "center"}}>Type in verification code that was sent to your email {userData.user.email}</Text>

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

      <Pressable onPress={onVerify} style={{marginTop: 20, backgroundColor: "#007BFF", padding: 10, borderRadius: 5}}>
        <Text style={{color: "#FFFFFF", fontWeight: "bold"}}>Verify account</Text>
      </Pressable>

      <Pressable onPress={onResend} style={{marginTop: 20}}>
        <Text style={{color: "#007BFF"}}>Resend code</Text>
      </Pressable>
    </View>
  );
}