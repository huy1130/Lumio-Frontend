import type {
  TenantSubscriptionInfo,
  TenantSubscriptionUiStatus,
} from "@/types/tenant-subscription";

const EXPIRING_SOON_DAYS = 7;

export interface TenantSubscriptionStatusView {
  status: TenantSubscriptionUiStatus;
  daysRemaining: number | null;
  title: string;
  message: string;
  variant: "success" | "warning" | "destructive" | "secondary";
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function getTenantSubscriptionStatusView(
  info: TenantSubscriptionInfo | null,
): TenantSubscriptionStatusView {
  if (!info?.subscription_id || !info.package_code) {
    return {
      status: "none",
      daysRemaining: null,
      title: "Chưa có gói đăng ký",
      message:
        "Tenant chưa có subscription active. Vui lòng mua gói để tiếp tục sử dụng đầy đủ tính năng.",
      variant: "destructive",
    };
  }

  const end = info.end_date ? new Date(info.end_date) : null;
  const expiredByFlag = info.is_expired;
  const expiredByDate = end != null && end.getTime() <= Date.now();

  if (expiredByFlag || expiredByDate) {
    return {
      status: "expired",
      daysRemaining: end ? daysUntil(end) : null,
      title: "Gói đã hết hạn",
      message: end
        ? `Gói ${info.package_code} đã hết hạn ngày ${end.toLocaleDateString("vi-VN")}. Gia hạn sớm để tránh bị xóa dữ liệu tenant.`
        : `Gói ${info.package_code} không còn hiệu lực. Gia hạn để tiếp tục sử dụng.`,
      variant: "destructive",
    };
  }

  if (end) {
    const remaining = daysUntil(end);
    if (remaining <= EXPIRING_SOON_DAYS) {
      return {
        status: "expiring_soon",
        daysRemaining: remaining,
        title: remaining <= 0 ? "Gói sắp hết hạn" : `Còn ${remaining} ngày`,
        message: `Gói ${info.package_code} hết hạn ${end.toLocaleDateString("vi-VN")}. Nên gia hạn trước khi hết hạn.`,
        variant: "warning",
      };
    }
  }

  return {
    status: "active",
    daysRemaining: end ? daysUntil(end) : null,
    title: "Đang hoạt động",
    message: end
      ? `Gói ${info.package_code} có hiệu lực đến ${end.toLocaleDateString("vi-VN")}.`
      : `Gói ${info.package_code} đang active.`,
    variant: "success",
  };
}
