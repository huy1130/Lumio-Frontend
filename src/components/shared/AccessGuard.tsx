"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/roles";

interface AccessGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side access guard. Redirects to /dashboard if the current role
 * is not in the allowed list. Renders nothing until access is confirmed.
 */
export function AccessGuard({ roles, children }: AccessGuardProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !roles.includes(role)) router.push("/dashboard");
  }, [role, router, roles, loading]);

  if (loading || !roles.includes(role)) return null;
  return <>{children}</>;
}
