import { Pressable, Text, View } from "react-native";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/core";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  useEffect(() => {

    const userData =  async () => {
      try {
        const response = await api.get("/api/client/info/");
        if (response.status === 200) {
          if (response.data.verified === false) {
            console.log("User email is not verified.");
            router.replace("/activate_account");
          }
        }
        console.log("User Data:", response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    if (isAuthenticated) {
      userData();
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
