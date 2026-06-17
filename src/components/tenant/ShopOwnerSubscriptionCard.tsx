"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { shopService } from "@/lib/services/shopService";
import { tenantSubscriptionService } from "@/lib/services/tenantSubscriptionService";
import { getTenantSubscriptionStatusView } from "@/lib/tenant-subscription-status";
import { formatDate } from "@/lib/utils";
import type { ShopQuota } from "@/types/shop-quota";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";

function formatPriceVnd(price: number | null, cycle: string | null) {
  if (price == null) return "—";
  const formatted = new Intl.NumberFormat("vi-VN").format(price);
  const normalized = cycle?.toUpperCase() ?? "";
  const suffix =
    normalized === "MONTHLY" ? "/tháng" : normalized === "YEARLY" ? "/năm" : "";
  return `${formatted} ₫${suffix}`;
}

export function ShopOwnerSubscriptionCard() {
  const [info, setInfo] = useState<TenantSubscriptionInfo | null>(null);
  const [quota, setQuota] = useState<ShopQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sub, q] = await Promise.all([
        tenantSubscriptionService.getMine(),
        shopService.getQuota().catch(() => null),
      ]);
      setInfo(sub);
      setQuota(q);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được gói đăng ký",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const view = getTenantSubscriptionStatusView(info);
  const showRenewCta =
    !!info?.subscription_id &&
    (view.status === "expired" ||
      view.status === "expiring_soon" ||
      view.status === "active");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gói đăng ký (Tenant)
        </CardTitle>
        <CardDescription>
          Thông tin gói và hạn mức cửa hàng của tenant bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải…
          </div>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="font-semibold">
                  {info?.package_code ?? "Chưa có gói"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {info?.tenant_name ? `Tenant: ${info.tenant_name}` : "—"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPriceVnd(info?.price ?? null, info?.billing_cycle ?? null)}
                  {info?.end_date
                    ? ` · Hết hạn ${formatDate(info.end_date)}`
                    : ""}
                </p>
              </div>
              <Badge variant={view.variant}>{view.title}</Badge>
            </div>

            <p className="text-sm text-muted-foreground">{view.message}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {quota?.current_count ?? 0}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{quota?.max_shops ?? "—"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Cửa hàng</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {info?.number_of_renewals ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Lần gia hạn</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm font-medium">
                  {info?.start_date ? formatDate(info.start_date) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Bắt đầu</p>
              </div>
            </div>

            {showRenewCta && (
              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">

                <Button asChild className="gap-2">
                  <Link href="/subscription/renew">
                    <ExternalLink className="h-4 w-4" />
                    Gia hạn gói
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
