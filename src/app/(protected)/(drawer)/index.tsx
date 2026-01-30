import { Text, View } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, userData, refreshUserData } = useAuth();
  // const [isReady, setIsReady] = useState(false);
  // const hasRedirected = useRef(false);
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //   refreshUserData().finally(() => { setIsReady(true); console.log("User data refreshed in indeex"); });
  // }, [isAuthenticated, refreshUserData]);



  useEffect(() => {
    console.log("Index useEffect triggered");
    // console.log(`isAuthenticated: ${isAuthenticated} userData: ${JSON.stringify(userData)} hasRedirected: ${hasRedirected.current}`);
    if (!isAuthenticated) router.replace("/(auth)/login");
    if (!userData) return;
    // if (!isReady) return;
    // if (hasRedirected.current) return;

    if (userData.verified === false) {
      // hasRedirected.current = true;
      console.log("redirecting to verify account");
      router.replace("/(protected)/(onboarding)/verify_account");
      return;
    }
    if (userData.subscription_plan === null) {
      // hasRedirected.current = true;

      console.log("redirecting to choose subscription");

      router.replace("/(protected)/(onboarding)/choose_subscription");
      return;
    }
    if (userData.active_workout_plan === null) {
      // hasRedirected.current = true;

      router.replace("/(protected)/(onboarding)/choose_workout_plan");
      return;
    }
  }, [isAuthenticated, userData, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading...</Text>
    </View>
  );
}
