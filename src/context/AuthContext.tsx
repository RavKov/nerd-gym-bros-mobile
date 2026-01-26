import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login as loginService, logout as logoutService } from "@/src/config/authService";
import { getAccess, getRefresh, getUserName, setUserName as persistUserName } from "@/src/config/authStorage";
import { api } from "@/src/config/api";
import { useRouter } from "expo-router";

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

        if (authenticated) refreshUserData();
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
            if (isAuthenticated) {
                const response = await api.get<ClientProfile>("/api/me/detail/");
                if (response.status === 200) setUserData(response.data);
            }
            else {
                setUserData(null);
            }
        }
        catch (error) {
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
