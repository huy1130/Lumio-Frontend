"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Copy,
  CheckCircle2,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

const getBankName = (bin: string) => {
  const map: Record<string, string> = {
    "970422": "MBBank",
    "970436": "Vietcombank",
    "970415": "VietinBank",
    "970418": "BIDV",
    "970405": "Agribank",
    "970407": "Techcombank",
    "970416": "ACB",
    "970432": "VPBank",
    "970423": "TPBank",
  };
  return map[bin] || bin;
};

function SubscriptionRenewContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [info, setInfo] = useState<TenantSubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<ApiSubscription[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PAYOS' | 'CASH'>('PAYOS');

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
      const active = list.filter((p) => p.is_active && p.package_code !== 'TRIAL_14_DAYS');
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

  useEffect(() => {
    if (!paymentData?.orderCode || paymentData?.isCash) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/subscriptions/purchase/status/${paymentData.orderCode}`);
        const statusData = await res.json();
        if (statusData?.status === 'PAID') {
          clearInterval(interval);
          toast.success("Thanh toán thành công!");
          router.push("/subscription/success?renew=1");
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentData?.orderCode, paymentData?.isCash, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã copy!");
  };

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
        body: JSON.stringify({ subscription_id: selectedId, payment_method: paymentMethod }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message ?? "Không khởi tạo được thanh toán",
        );
      }
      if (data?.isCash) {
        setPaymentData({ ...data, isCash: true });
        return;
      } else if (data?.qrCode) {
        if (data.orderCode) {
          try {
            sessionStorage.setItem("lumio_payos_order_code", String(data.orderCode));
          } catch {
            /* ignore */
          }
        }
        setPaymentData(data);
        return;
      } else if (data?.checkoutUrl) {
        // Fallback in case qrCode is not returned
        window.location.href = data.checkoutUrl as string;
        return;
      }
      throw new Error("Không nhận được phản hồi thanh toán");
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
        <h1 className="text-2xl font-bold tracking-tight">Nâng cấp gói sử dụng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Giao dịch chỉ hoàn tất khi thanh toán thành công.
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
      ) : paymentData?.isCash ? (
        <Card className="mx-auto max-w-sm text-center py-8">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle>Yêu cầu thành công!</CardTitle>
            <CardDescription className="mt-2">
              Bạn đã chọn thanh toán bằng tiền mặt/chuyển khoản thủ công. Vui lòng thanh toán cho Admin để được duyệt gói.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2 text-sm border border-gray-200 dark:border-gray-700">
               <p className="text-gray-500 dark:text-gray-400">Mã đơn hàng: <span className="font-semibold text-gray-900 dark:text-gray-100">{paymentData.orderCode}</span></p>
               <p className="text-gray-500 dark:text-gray-400">Trạng thái: <span className="font-semibold text-amber-500">Chờ Admin duyệt</span></p>
             </div>
             <Button
                variant="outline"
                className="w-full h-11 rounded-xl mt-2"
                onClick={() => setPaymentData(null)}
              >
                Trở lại
              </Button>
          </CardContent>
        </Card>
      ) : paymentData ? (
        <Card className="mx-auto max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Thanh toán đơn hàng</CardTitle>
            <CardDescription>
              Quét mã QR qua ứng dụng ngân hàng để thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center rounded-xl bg-white p-4 shadow-sm border">
              <QRCodeSVG
                value={paymentData.qrCode}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>
            
            <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Ngân hàng</span>
                <span className="font-medium text-right">{getBankName(String(paymentData.bin))}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Chủ tài khoản</span>
                <span className="font-medium text-right">{paymentData.accountName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{paymentData.accountNumber}</span>
                  <button onClick={() => copyToClipboard(paymentData.accountNumber)} className="text-indigo-600 hover:text-indigo-800">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-medium text-indigo-600">{formatCurrency(paymentData.amount)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Nội dung</span>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-medium break-all">{paymentData.description}</span>
                  <button onClick={() => copyToClipboard(paymentData.description)} className="text-indigo-600 hover:text-indigo-800 shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Đang chờ thanh toán...
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => setPaymentData(null)}>
              Hủy thanh toán
            </Button>
          </CardContent>
        </Card>
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
                Chọn gói mới bên dưới.
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

                  {/* Payment Method Selection */}
                  <div className="space-y-3 mt-6 mb-4">
                    <p className="text-sm font-medium">Phương thức thanh toán</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                          paymentMethod === 'PAYOS'
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">PayOS</p>
                            <p className="text-[10px] text-gray-500">Quét mã QR tự động</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="sr-only"
                          checked={paymentMethod === 'PAYOS'}
                          onChange={() => setPaymentMethod('PAYOS')}
                        />
                      </label>

                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                          paymentMethod === 'CASH'
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm">$$</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Tiền mặt</p>
                            <p className="text-[10px] text-gray-500">Thủ công</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="sr-only"
                          checked={paymentMethod === 'CASH'}
                          onChange={() => setPaymentMethod('CASH')}
                        />
                      </label>
                    </div>
                  </div>

              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!selected || paying}
                onClick={() => void handlePayOs()}
              >
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  paymentMethod === 'PAYOS' && <CreditCard className="h-4 w-4" />
                )}
                {paying ? "Đang xử lý…" : paymentMethod === 'CASH' ? "Gửi yêu cầu thanh toán" : "Thanh toán PayOS để nâng cấp"}
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
