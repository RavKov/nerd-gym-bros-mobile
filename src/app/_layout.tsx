import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { SplashScreenController } from "@/src/components/splash";
import { useAuth } from "@/src/context/AuthContext";
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from "@/src/config/env";

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated} >
          <Stack.Screen name="(protected)/(drawer)" options={{ headerShown: false  }} />
          <Stack.Screen name="(protected)/(additional)" options={{ headerShown: false  }} />
          <Stack.Screen name="(protected)/(onboarding)" options={{ headerShown: false  }} />

        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />

        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <RootNavigator />
      </StripeProvider>
    </AuthProvider>
  );
}