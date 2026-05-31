import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { login as loginService, logout as logoutService } from "@/src/config/authService";
import { getAccess, getRefresh } from "@/src/config/authStorage";
import { setOnSessionExpired } from "@/src/config/session";
import { queryKeys, useClientProfile, useWorkoutPlanRun } from "@/src/hooks/useApiQueries";

import type { ClientProfile } from "@/src/types/clientProfile";
import type { WorkoutPlanRun } from "@/src/types/workoutPlanRun";

type AuthContextValue = {
  isLoading: boolean;
  isAuthActionLoading: boolean;
  isAuthenticated: boolean;
  userData: ClientProfile | null;
  workoutPlanRun: WorkoutPlanRun | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshWorkoutPlanRun: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [sessionBootstrapping, setSessionBootstrapping] = useState(true);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const profileQuery = useClientProfile(isAuthenticated);
  const workoutRunQuery = useWorkoutPlanRun(isAuthenticated);

  const clearServerState = useCallback(() => {
    queryClient.removeQueries({ queryKey: queryKeys.profile });
    queryClient.removeQueries({ queryKey: queryKeys.workoutPlanRun });
  }, [queryClient]);

  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    clearServerState();
  }, [clearServerState]);

  const handleSessionExpired = useCallback(async () => {
    await logoutService();
    queryClient.clear();
    clearAuthState();
  }, [queryClient, clearAuthState]);

  useEffect(() => {
    setOnSessionExpired(() => {
      void handleSessionExpired();
    });
    return () => setOnSessionExpired(null);
  }, [handleSessionExpired]);

  const refreshUserData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
  }, [queryClient]);

  const refreshWorkoutPlanRun = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlanRun });
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
    let authenticated = Boolean(access || refresh);
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      clearServerState();
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlanRun }),
    ]);

    const [accessAfter, refreshAfter] = await Promise.all([getAccess(), getRefresh()]);
    authenticated = Boolean(accessAfter || refreshAfter);
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      clearServerState();
    }
  }, [queryClient, clearServerState]);

  useEffect(() => {
    (async () => {
      try {
        await refreshSession();
      } finally {
        setSessionBootstrapping(false);
      }
    })();
  }, [refreshSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsAuthActionLoading(true);
      try {
        await loginService(username, password);
        await refreshSession();
      } finally {
        setIsAuthActionLoading(false);
      }
    },
    [refreshSession]
  );

  const logout = useCallback(async () => {
    setIsAuthActionLoading(true);
    try {
      await logoutService();
      queryClient.clear();
      clearAuthState();
    } finally {
      setIsAuthActionLoading(false);
    }
  }, [queryClient, clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading: sessionBootstrapping,
      isAuthActionLoading,
      isAuthenticated,
      userData: profileQuery.data ?? null,
      workoutPlanRun: workoutRunQuery.data ?? null,
      login,
      logout,
      refreshSession,
      refreshUserData,
      refreshWorkoutPlanRun,
    }),
    [
      sessionBootstrapping,
      isAuthActionLoading,
      isAuthenticated,
      profileQuery.data,
      workoutRunQuery.data,
      login,
      logout,
      refreshSession,
      refreshUserData,
      refreshWorkoutPlanRun,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
