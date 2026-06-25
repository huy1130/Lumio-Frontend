"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { tenantSubscriptionService } from "@/lib/services/tenantSubscriptionService";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ALLOWED_PATHS = ["/settings", "/subscription/renew", "/subscriptions/requests"];

export function RequireSubscription({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const load = useCallback(async () => {
    // Admin and non-tenant users are not restricted by tenant subscriptions
    if (role === "admin" || !user?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await tenantSubscriptionService.getMine();
      // If no subscription or it is expired
      if (!data || data.is_expired || (data.end_date && new Date(data.end_date) < new Date())) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch (err) {
      setIsLocked(true);
    } finally {
      setLoading(false);
    }
  }, [role, user?.tenant_id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!loading && isLocked) {
      const isAllowedPath = ALLOWED_PATHS.some((path) => pathname.startsWith(path));
      if (!isAllowedPath) {
        router.replace("/settings");
      }
    }
  }, [loading, isLocked, pathname, router]);

  return (
    <>
      {loading && (
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      )}
      <div style={{ display: loading ? "none" : "contents" }}>
        {children}
      </div>
    </>
  );
}
