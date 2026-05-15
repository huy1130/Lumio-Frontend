import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thanh toán thành công · Lumio",
  description: "Cảm ơn bạn đã thanh toán.",
};

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function SubscriptionSuccessPage({ searchParams }: Props) {
  const orderCode =
    typeof searchParams.orderCode === "string" ? searchParams.orderCode : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        Thanh toán thành công
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        PayOS đã xác nhận thanh toán. Tài khoản và tenant của bạn sẽ được kích hoạt trong
        giây lát. Đăng nhập bằng email và mật khẩu đã đăng ký, sau đó vào mục{" "}
        <strong className="font-medium text-gray-800 dark:text-gray-200">Cửa hàng</strong>{" "}
        để tạo shop — cửa hàng không được tạo tự động khi thanh toán.
      </p>
      {(orderCode || status) && (
        <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
          {status && <span className="block">Trạng thái: {status}</span>}
          {orderCode && (
            <span className="mt-1 block font-mono">
              Mã đơn: {orderCode}
            </span>
          )}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="rounded-xl">
          <Link href="/login">Đăng nhập</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
