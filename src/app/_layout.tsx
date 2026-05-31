import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { ContentProvider } from "@/src/context/ContentContext";
import { queryClient } from "@/src/lib/queryClient";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { SplashScreenController } from "@/src/components/splash";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "@/src/config/env";

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(protected)/(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)/(additional)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)/(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)/current_workout" options={{ headerShown: false }} />
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <AuthProvider>
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
              <RootNavigator />
            </StripeProvider>
          </AuthProvider>
        </ContentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
