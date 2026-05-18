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

type Phase = "polling" | "paid" | "failed" | "timeout";

interface SubscriptionSuccessClientProps {
  orderCodeFromUrl?: string;
  statusFromUrl?: string;
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
}: SubscriptionSuccessClientProps) {
  const orderCode = useMemo(
    () => orderCodeFromUrl ?? readStoredOrderCode(),
    [orderCodeFromUrl],
  );

  const [phase, setPhase] = useState<Phase>(orderCode ? "polling" : "timeout");
  const [lastStatus, setLastStatus] = useState<PurchaseStatus | null>(
    statusFromUrl ?? null,
  );
  const attemptsRef = useRef(0);

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
        };

        if (res.ok) {
          const status = data.status ?? "PENDING";
          setLastStatus(status);

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
            status === "CANCELLED" ||
            status === "EXPIRED" ||
            status === "FAILED"
          ) {
            setPhase("failed");
            return;
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
  }, [orderCode]);

  if (phase === "polling") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Đang kích hoạt tài khoản
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          PayOS đã nhận thanh toán. Hệ thống đang tạo tenant và tài khoản Shop
          Owner — vui lòng đợi trong giây lát.
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
          Kích hoạt thành công
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Tài khoản và tenant đã sẵn sàng. Đăng nhập và vào{" "}
          <strong className="font-medium text-gray-800 dark:text-gray-200">
            Cửa hàng
          </strong>{" "}
          để tạo shop đầu tiên.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl">
            <Link href="/login">Đăng nhập ngay</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const failedTitle =
    lastStatus === "CANCELLED"
      ? "Thanh toán đã hủy"
      : lastStatus === "EXPIRED"
        ? "Phiên thanh toán hết hạn"
        : "Chưa kích hoạt được tài khoản";

  const failedMessage =
    phase === "timeout"
      ? "Webhook có thể chậm. Thử đăng nhập — nếu không được, liên hệ hỗ trợ kèm mã đơn."
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
          <Link href="/pricing">Thử lại</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    </div>
  );
}

