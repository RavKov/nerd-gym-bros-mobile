import { Text, View } from "react-native";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, userData, refreshUserData } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUserData();
  }, [isAuthenticated, refreshUserData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!userData) return;

    if (userData.verified === false) {
      router.replace("/verify_account");
      return;
    }
    if (userData.subscription_plan === null) {
      router.replace("/choose_subscription");
      return;
    }
    if (userData.active_workout_plan === null) {
      router.replace("/choose_workout_plan");
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
