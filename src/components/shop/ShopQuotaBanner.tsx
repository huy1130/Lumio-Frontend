"use client";

import type { ShopQuota } from "@/types/shop-quota";

interface ShopQuotaBannerProps {
  quota: ShopQuota | null;
  loading?: boolean;
}

export function ShopQuotaBanner({ quota, loading }: ShopQuotaBannerProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-500">Đang tải hạn mức cửa hàng theo gói…</p>
    );
  }

  if (!quota) return null;

  const maxLabel = quota.max_shops != null ? String(quota.max_shops) : "—";

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm dark:border-indigo-900/50 dark:bg-indigo-950/40">
      <p className="font-medium text-indigo-900 dark:text-indigo-100">
        Gói {quota.package_code ?? "đăng ký"}: {quota.current_count} / {maxLabel} cửa
        hàng
      </p>
      <p className="mt-0.5 text-xs text-indigo-700/80 dark:text-indigo-300/80">
        {quota.can_create_more
          ? `Bạn có thể tạo thêm ${quota.max_shops! - quota.current_count} cửa hàng.`
          : quota.max_shops != null
            ? "Đã đạt giới hạn cửa hàng của gói. Nâng cấp gói để tạo thêm."
            : "Gói hiện tại không hỗ trợ tạo cửa hàng hoặc chưa có gói active."}
      </p>
    </div>
  );
}
