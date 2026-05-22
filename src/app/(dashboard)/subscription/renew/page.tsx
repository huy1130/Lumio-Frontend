"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tenantSubscriptionService } from "@/lib/services/tenantSubscriptionService";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiSubscription } from "@/types";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";
import { toast } from "sonner";
import { getToken } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function SubscriptionRenewContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [info, setInfo] = useState<TenantSubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<ApiSubscription[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sub, res] = await Promise.all([
        tenantSubscriptionService.getMine(),
        fetch(`${API_URL}/subscriptions`, { cache: "no-store" }),
      ]);
      setInfo(sub);
      if (!res.ok) throw new Error("Không tải được danh sách gói");
      const raw: unknown = await res.json();
      const list: ApiSubscription[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: ApiSubscription[] })?.data)
          ? (raw as { data: ApiSubscription[] }).data
          : [];
      const active = list.filter((p) => p.is_active);
      setPlans(active);
      setSelectedId(sub.subscription_id ?? active[0]?.id ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePayOs() {
    if (!selectedId) return;
    const token = getToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập lại");
      router.push("/login");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/checkout/renew/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_id: selectedId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message ?? "Không khởi tạo được thanh toán",
        );
      }
      if (data?.checkoutUrl) {
        if (data.orderCode) {
          try {
            sessionStorage.setItem(
              "lumio_payos_order_code",
              String(data.orderCode),
            );
          } catch {
            /* ignore */
          }
        }
        window.location.href = data.checkoutUrl as string;
        return;
      }
      throw new Error("Không nhận được link PayOS");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi thanh toán");
    } finally {
      setPaying(false);
    }
  }

  const selected = plans.find((p) => p.id === selectedId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 pb-10">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/settings">
          <ArrowLeft className="h-4 w-4" />
          Quay lại cài đặt
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gia hạn gói qua PayOS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gia hạn chỉ hoàn tất khi PayOS báo thanh toán thành công.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gói hiện tại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Gói: </span>
                {info?.package_code ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Hết hạn: </span>
                {info?.end_date ? formatDate(info.end_date) : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Đã gia hạn: </span>
                {info?.number_of_renewals ?? 0} lần
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chọn gói thanh toán</CardTitle>
              <CardDescription>
                Chọn gói và thanh toán qua PayOS để gia hạn tenant hiện tại.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có gói active.</p>
              ) : (
                plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                      selectedId === plan.id
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        checked={selectedId === plan.id}
                        onChange={() => setSelectedId(plan.id)}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-medium">{plan.package_code}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {plan.billing_cycle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(parseFloat(plan.price))}
                      </p>
                      {plan.id === info?.subscription_id && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Đang dùng
                        </Badge>
                      )}
                    </div>
                  </label>
                ))
              )}

              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!selected || paying}
                onClick={() => void handlePayOs()}
              >
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {paying ? "Đang chuyển PayOS…" : "Thanh toán PayOS để gia hạn"}
              </Button>

              {selected && (
                <p className="text-center text-xs text-muted-foreground">
                  Gói chọn: {selected.package_code}
                </p>
              )}
            </CardContent>
          </Card>

          {user?.email && (
            <p className="text-center text-xs text-muted-foreground">
              Tài khoản: {user.email}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function SubscriptionRenewPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <SubscriptionRenewContent />
    </AccessGuard>
  );
}
