"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Role, MockUser } from "@/config/roles";
import { MOCK_USERS } from "@/config/roles";
import { setToken, clearToken } from "@/lib/api";
import type { ApiAdmin } from "@/types";

interface AuthContextValue {
  // ── mock / demo role (non-admin roles) ──────────────────────────────────────
  role:    Role;
  user:    MockUser;
  setRole: (role: Role) => void;

  // ── real admin session ───────────────────────────────────────────────────────
  apiAdmin: ApiAdmin | null;
  loginAdmin:  (token: string, admin: ApiAdmin) => void;
  logoutAdmin: () => void;
  isRealAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_KEY       = "pos_demo_role";
const ADMIN_DATA_KEY = "lumio_admin_data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState]       = useState<Role>("admin");
  const [apiAdmin, setApiAdmin]    = useState<ApiAdmin | null>(null);

  // Rehydrate from localStorage after mount
  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_KEY) as Role | null;
    if (savedRole && savedRole in MOCK_USERS) setRoleState(savedRole);

    const savedAdmin = localStorage.getItem(ADMIN_DATA_KEY);
    if (savedAdmin) {
      try {
        setApiAdmin(JSON.parse(savedAdmin) as ApiAdmin);
      } catch {
        localStorage.removeItem(ADMIN_DATA_KEY);
      }
    }
  }, []);

  function setRole(newRole: Role) {
    setRoleState(newRole);
    localStorage.setItem(ROLE_KEY, newRole);
  }

  function loginAdmin(token: string, admin: ApiAdmin) {
    setToken(token);
    setApiAdmin(admin);
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));
    // Sync mock role so route guards pass
    setRole("admin");
  }

  function logoutAdmin() {
    clearToken();
    setApiAdmin(null);
    localStorage.removeItem(ADMIN_DATA_KEY);
    setRole("admin");
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        user: MOCK_USERS[role],
        setRole,
        apiAdmin,
        loginAdmin,
        logoutAdmin,
        isRealAdmin: apiAdmin !== null,
      }}
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
