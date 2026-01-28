import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login as loginService, logout as logoutService } from "@/src/config/authService";
import { getAccess, getRefresh, getUserName, setUserName as persistUserName } from "@/src/config/authStorage";
import { api } from "@/src/config/api";
import { useRouter } from "expo-router";
import axios from "axios";

import type { ClientProfile } from "@/src/types/clientProfile";



type AuthContextValue = {
    isLoading: boolean;
    isAuthActionLoading: boolean;
    isAuthenticated: boolean;
    userData: ClientProfile | null;
    setUserData: React.Dispatch<React.SetStateAction<ClientProfile | null>>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    refreshUserData: () => Promise<void>;

};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<ClientProfile | null>(null);

    const refreshSession = async () => {
        const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
        const authenticated = Boolean(access || refresh);
        setIsAuthenticated(authenticated);

        if (authenticated) {
            await refreshUserData();
        } else {
            setUserData(null);
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
            setUserData,
            login,
            logout,
            refreshSession,
            refreshUserData,
        }),
        [isLoading, isAuthActionLoading, isAuthenticated, userData]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
