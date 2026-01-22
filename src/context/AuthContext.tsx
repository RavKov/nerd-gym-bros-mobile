import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login as loginService, logout as logoutService } from "@/src/config/authService";
import { getAccess, getRefresh, getUserName, setUserName as persistUserName } from "@/src/config/authStorage";

type AuthContextValue = {
    isLoading: boolean;
    isAuthActionLoading: boolean;
    isAuthenticated: boolean;
    userName: string;
    userData: any;
    setUserData: React.Dispatch<React.SetStateAction<any>>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;

};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState<string>("");
    const [userData, setUserData] = useState<any>(null);

    const refreshSession = async () => {
        const [access, refresh] = await Promise.all([getAccess(), getRefresh()]);
        const authenticated = Boolean(access || refresh);
        setIsAuthenticated(authenticated);

        if (authenticated) {
            const storedUserName = await getUserName();
            setUserName(storedUserName ?? "");
        } else {
            setUserName("");
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

    const login = async (username: string, password: string) => {
        setIsAuthActionLoading(true);
        try {
            await loginService(username, password);
            await persistUserName(username);
            await refreshSession();
        } finally {
            setIsAuthActionLoading(false);
        }
    };

    const logout = async () => {
        setIsAuthActionLoading(true);
        try {
            await logoutService();
            setUserName("");
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
            userName,
            userData,
            setUserData,
            login,
            logout,
            refreshSession,
        }),
        [isLoading, isAuthActionLoading, isAuthenticated, userName, userData]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
