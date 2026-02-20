import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

void SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
