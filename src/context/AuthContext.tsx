"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/config/roles";
import { getRoleFromId } from "@/config/roles";
import type { AuthUser } from "@/types/user";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/api-client";

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  role: Role;
  loading: boolean;
  setSession: (token: string, nextUser: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setAccessToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  const role = useMemo<Role>(() => {
    if (!user) return "user";
    return user.role ?? getRoleFromId(user.role_id);
  }, [user]);

  function setSession(token: string, nextUser: AuthUser) {
    setAccessToken(token);
    setUser(nextUser);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ accessToken, user, role, loading, setSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
