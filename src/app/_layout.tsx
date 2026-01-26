import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { SplashScreenController } from "@/src/components/splash";
import { useAuth } from "@/src/context/AuthContext";
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from "@/src/config/env";

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <>
      <SplashScreenController />
      <Stack>
        <Stack.Protected guard={!isLoading && isAuthenticated}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
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
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <RootNavigator />
      </StripeProvider>
    </AuthProvider>
  );
}