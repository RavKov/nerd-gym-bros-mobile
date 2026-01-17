import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { SplashScreenController } from "@/src/components/splash";
import { useAuth } from "@/src/context/AuthContext";

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <>
      <SplashScreenController />
      <Stack>
        <Stack.Protected guard={!isLoading && isAuthenticated}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoading && !isAuthenticated}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}