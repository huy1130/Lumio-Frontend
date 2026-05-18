"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { tenantSubscriptionService } from "@/lib/services/tenantSubscriptionService";
import { getTenantSubscriptionStatusView } from "@/lib/tenant-subscription-status";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";

interface TenantSubscriptionBannerProps {
  className?: string;
}

export function TenantSubscriptionBanner({
  className = "",
}: TenantSubscriptionBannerProps) {
  const { role, user } = useAuth();
  const [info, setInfo] = useState<TenantSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (role !== "shop_owner" || user?.tenant_id == null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await tenantSubscriptionService.getMine();
      setInfo(data);
    } catch (err) {
      setInfo(null);
      setError(
        err instanceof Error ? err.message : "Không tải được gói đăng ký",
      );
    } finally {
      setLoading(false);
    }
  }, [role, user?.tenant_id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (role !== "shop_owner" || user?.tenant_id == null) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải thông tin gói đăng ký…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 ${className}`}>
        <p className="font-medium">Không tải được gói đăng ký</p>
        <p className="mt-0.5 text-xs opacity-90">{error}</p>
      </div>
    );
  }

  const view = getTenantSubscriptionStatusView(info);

  if (view.status === "active") {
    return null;
  }

  const borderTone =
    view.variant === "destructive"
      ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40"
      : view.variant === "warning"
        ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40"
        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50";

  const textTone =
    view.variant === "destructive"
      ? "text-red-900 dark:text-red-100"
      : view.variant === "warning"
        ? "text-amber-900 dark:text-amber-100"
        : "text-slate-800 dark:text-slate-200";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${borderTone} ${className}`}
      role="alert"
    >
      <div className={`flex gap-3 ${textTone}`}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{view.title}</p>
            <Badge variant={view.variant}>{info?.package_code ?? "—"}</Badge>
          </div>
          <p className="mt-0.5 text-xs opacity-90">{view.message}</p>
          {info?.tenant_name ? (
            <p className="mt-1 text-xs opacity-75">Tenant: {info.tenant_name}</p>
          ) : null}
        </div>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-lg">
        <Link href="/settings">Xem gói đăng ký</Link>
      </Button>
    </div>
  );
}
