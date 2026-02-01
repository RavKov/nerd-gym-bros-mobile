import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login as loginService, logout as logoutService } from "@/src/config/authService";
import { getAccess, getRefresh, getUserName, setUserName as persistUserName } from "@/src/config/authStorage";
import { api } from "@/src/config/api";
import { useRouter } from "expo-router";
import axios from "axios";

import type { ClientProfile } from "@/src/types/clientProfile";
import type { WorkoutPlanRun } from "@/src/types/workoutPlanRun";



type AuthContextValue = {
    isLoading: boolean;
    isAuthActionLoading: boolean;
    isAuthenticated: boolean;
    userData: ClientProfile | null;
    workoutPlanRun: WorkoutPlanRun | null;
    setUserData: React.Dispatch<React.SetStateAction<ClientProfile | null>>;
    setWorkoutPlanRun: React.Dispatch<React.SetStateAction<WorkoutPlanRun | null>>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    refreshWorkoutPlanRun: () => Promise<void>;

};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<ClientProfile | null>(null);
    const [workoutPlanRun, setWorkoutPlanRun] = useState<WorkoutPlanRun | null>(null);

    const refreshSession = async () => {
        const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
        const authenticated = Boolean(access || refresh);
        setIsAuthenticated(authenticated);

        if (authenticated) {
            await refreshUserData();
        } else {
            setUserData(null);
            setWorkoutPlanRun(null);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await refreshSession();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const refreshUserData = async () => {
        try {
            // Don't rely on potentially stale state; check tokens directly.
            const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
            const authenticated = Boolean(access || refresh);
            if (!authenticated) {
                setUserData(null);
                setWorkoutPlanRun(null);
                return;
            }

            const response = await api.get<ClientProfile>("/api/me/detail/");
            if (response.status === 200) setUserData(response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Expected during logout / token transitions.
                return;
            }
            console.error("Error fetching user data:", error);
        }
    };

    const refreshWorkoutPlanRun = async () => {
        try {
            const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
            const authenticated = Boolean(access || refresh);
            if (!authenticated) {
                setWorkoutPlanRun(null);
                return;
            }

            const response = await api.get<WorkoutPlanRun>("/api/me/workout_plan_run/");
            if (response.status === 200) setWorkoutPlanRun(response.data);
        } catch (error) {
            // If user has no active plan/run, backend may return 404/400; clear state.
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 404) {
                    setWorkoutPlanRun(null);
                    return;
                }
            }
            console.error("Error fetching workout plan run:", error);
        }
    };
    const login = async (username: string, password: string) => {
        setIsAuthActionLoading(true);
        try {
            await loginService(username, password);
            await refreshSession();
        } finally {
            setIsAuthActionLoading(false);
        }
    };

    const logout = async () => {
        setIsAuthActionLoading(true);
        try {
            await logoutService();
            setIsAuthenticated(false);
            setUserData(null);
            setWorkoutPlanRun(null);
        } finally {
            setIsAuthActionLoading(false);
        }
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            isLoading,
            isAuthActionLoading,
            isAuthenticated,
            userData,
            workoutPlanRun,
            setUserData,
            setWorkoutPlanRun,
            login,
            logout,
            refreshSession,
            refreshUserData,
            refreshWorkoutPlanRun,
        }),
        [isLoading, isAuthActionLoading, isAuthenticated, userData, workoutPlanRun]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
