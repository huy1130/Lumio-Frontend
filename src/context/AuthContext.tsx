"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Role, MockUser } from "@/config/roles";
import { MOCK_USERS } from "@/config/roles";

interface AuthContextValue {
  role:    Role;
  user:    MockUser;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "pos_demo_role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");

  // Rehydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Role | null;
    if (saved && saved in MOCK_USERS) setRoleState(saved);
  }, []);

  function setRole(newRole: Role) {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEY, newRole);
  }

  return (
    <AuthContext.Provider value={{ role, user: MOCK_USERS[role], setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
