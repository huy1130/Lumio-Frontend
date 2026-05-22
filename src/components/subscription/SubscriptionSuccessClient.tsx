"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60;

type PurchaseStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED"
  | string;

type PurchaseType = "NEW" | "RENEW" | string;

type Phase = "polling" | "paid" | "failed" | "timeout";

interface SubscriptionSuccessClientProps {
  orderCodeFromUrl?: string;
  statusFromUrl?: string;
  /** Mã kết quả PayOS trên returnUrl (00 = thành công) */
  payosCodeFromUrl?: string;
  /** true khi PayOS returnUrl có ?renew=1 (gia hạn gói) */
  isRenew?: boolean;
}

function readStoredOrderCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return sessionStorage.getItem("lumio_payos_order_code") ?? undefined;
  } catch {
    return undefined;
  }
}

export function SubscriptionSuccessClient({
  orderCodeFromUrl,
  statusFromUrl,
  payosCodeFromUrl,
  isRenew = false,
}: SubscriptionSuccessClientProps) {
  const orderCode = useMemo(
    () => orderCodeFromUrl ?? readStoredOrderCode(),
    [orderCodeFromUrl],
  );

  const [phase, setPhase] = useState<Phase>(orderCode ? "polling" : "timeout");
  const [lastStatus, setLastStatus] = useState<PurchaseStatus | null>(
    statusFromUrl ?? null,
  );
  const [purchaseType, setPurchaseType] = useState<PurchaseType | null>(null);
  const attemptsRef = useRef(0);
  const confirmAttemptedRef = useRef(false);

  const isRenewFlow =
    isRenew || purchaseType === "RENEW";

  const shouldTryConfirm =
    payosCodeFromUrl === "00" &&
    (statusFromUrl === "PAID" || statusFromUrl === "paid");

  async function requestPaymentConfirm(code: string): Promise<boolean> {
    try {
      const res = await fetch("/api/subscriptions/purchase/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode: code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        status?: PurchaseStatus;
        purchase_type?: PurchaseType;
      };
      if (data.purchase_type) setPurchaseType(data.purchase_type);
      if (res.ok && (data.success || data.status === "PAID")) {
        setLastStatus("PAID");
        setPhase("paid");
        try {
          sessionStorage.removeItem("lumio_payos_order_code");
        } catch {
          /* ignore */
        }
        return true;
      }
    } catch {
      /* retry via poll */
    }
    return false;
  }

  useEffect(() => {
    if (!orderCode || !shouldTryConfirm || confirmAttemptedRef.current) return;
    confirmAttemptedRef.current = true;
    void requestPaymentConfirm(orderCode);
  }, [orderCode, shouldTryConfirm]);

  useEffect(() => {
    if (!orderCode) return;
    const code: string = orderCode;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      if (cancelled) return;

      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_ATTEMPTS) {
        setPhase("timeout");
        return;
      }

      try {
        const res = await fetch(
          `/api/subscriptions/purchase/status/${encodeURIComponent(code)}`,
          { cache: "no-store" },
        );
        const data = (await res.json().catch(() => ({}))) as {
          status?: PurchaseStatus;
          purchase_type?: PurchaseType;
        };

        if (res.ok) {
          const status = data.status ?? "PENDING";
          setLastStatus(status);
          if (data.purchase_type) {
            setPurchaseType(data.purchase_type);
          }

          if (status === "PAID") {
            setPhase("paid");
            try {
              sessionStorage.removeItem("lumio_payos_order_code");
            } catch {
              /* ignore */
            }
            return;
          }

          if (
            status === "EXPIRED" &&
            shouldTryConfirm &&
            attemptsRef.current <= 3
          ) {
            const ok = await requestPaymentConfirm(code);
            if (ok) return;
          }

          if (
            status === "CANCELLED" ||
            status === "EXPIRED" ||
            status === "FAILED"
          ) {
            setPhase("failed");
            return;
          }

          if (
            status === "PENDING" &&
            shouldTryConfirm &&
            attemptsRef.current % 3 === 0
          ) {
            const ok = await requestPaymentConfirm(code);
            if (ok) return;
          }
        }
      } catch {
        /* retry */
      }

      if (!cancelled) {
        timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
      }
    }

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderCode, shouldTryConfirm]);

  if (phase === "polling") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {isRenewFlow ? "Đang gia hạn gói" : "Đang kích hoạt tài khoản"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {isRenewFlow
            ? "PayOS đã nhận thanh toán. Hệ thống đang cập nhật thời hạn gói đăng ký — vui lòng đợi trong giây lát."
            : "PayOS đã nhận thanh toán. Hệ thống đang tạo tenant và tài khoản Shop Owner — vui lòng đợi trong giây lát."}
        </p>
        {orderCode ? (
          <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            <span className="block">Trạng thái: {lastStatus ?? "PENDING"}</span>
            <span className="mt-1 block font-mono">Mã đơn: {orderCode}</span>
          </p>
        ) : null}
      </div>
    );
  }

  if (phase === "paid") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {isRenewFlow ? "Gia hạn thành công" : "Kích hoạt thành công"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {isRenewFlow ? (
            <>
              Gói đăng ký của tenant đã được gia hạn. Vào{" "}
              <strong className="font-medium text-gray-800 dark:text-gray-200">
                Cài đặt
              </strong>{" "}
              để xem ngày hết hạn mới.
            </>
          ) : (
            <>
              Tài khoản và tenant đã sẵn sàng. Đăng nhập và vào{" "}
              <strong className="font-medium text-gray-800 dark:text-gray-200">
                Cửa hàng
              </strong>{" "}
              để tạo shop đầu tiên.
            </>
          )}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isRenewFlow ? (
            <>
              <Button asChild className="rounded-xl">
                <Link href="/settings">Về cài đặt</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard">Bảng điều khiển</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="rounded-xl">
                <Link href="/login">Đăng nhập ngay</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const failedTitle =
    lastStatus === "CANCELLED"
      ? "Thanh toán đã hủy"
      : lastStatus === "EXPIRED"
        ? "Phiên thanh toán hết hạn"
        : isRenewFlow
          ? "Chưa gia hạn được gói"
          : "Chưa kích hoạt được tài khoản";

  const failedMessage =
    phase === "timeout"
      ? isRenewFlow
        ? "Webhook có thể chậm. Kiểm tra lại gói trong Cài đặt — nếu chưa cập nhật, liên hệ hỗ trợ kèm mã đơn."
        : "Webhook có thể chậm. Thử đăng nhập — nếu không được, liên hệ hỗ trợ kèm mã đơn."
      : "Giao dịch chưa hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.";

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        {phase === "timeout" ? (
          <Clock className="h-9 w-9" aria-hidden />
        ) : (
          <XCircle className="h-9 w-9" aria-hidden />
        )}
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        {failedTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {failedMessage}
      </p>
      {(orderCode || lastStatus) && (
        <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
          {lastStatus ? (
            <span className="block">Trạng thái: {lastStatus}</span>
          ) : null}
          {orderCode ? (
            <span className="mt-1 block font-mono">Mã đơn: {orderCode}</span>
          ) : null}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="rounded-xl">
          <Link href={isRenewFlow ? "/subscription/renew" : "/pricing"}>
            Thử lại
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={isRenewFlow ? "/settings" : "/login"}>
            {isRenewFlow ? "Cài đặt" : "Đăng nhập"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
