import { getActiveShopId } from "@/lib/active-shop";
import type { Shop } from "@/types/shop";
import type { AuthUser } from "@/types/user";

/** Shop đang quản lý: active local → user.shop_id → shop đầu tiên */
export function pickPrimaryShop(shops: Shop[], user: AuthUser): Shop | null {
  if (shops.length === 0) return null;

  const forTenant =
    user.tenant_id != null
      ? shops.filter((s) => s.tenant_id === user.tenant_id)
      : shops;

  if (forTenant.length === 0) return null;

  const activeId = getActiveShopId(user.tenant_id);
  if (activeId != null) {
    const active = forTenant.find((s) => s.id === activeId);
    if (active) return active;
  }

  if (user.shop_id != null && user.shop_id > 0) {
    const linked = forTenant.find((s) => s.id === user.shop_id);
    if (linked) return linked;
  }

  return forTenant[0];
}

/** Cần màn chọn shop khi có từ 2 shop và chưa có active hợp lệ */
export function needsShopSelection(shops: Shop[], user: AuthUser): boolean {
  const forTenant =
    user.tenant_id != null
      ? shops.filter((s) => s.tenant_id === user.tenant_id)
      : shops;

  if (forTenant.length < 2) return false;

  const activeId = getActiveShopId(user.tenant_id);
  if (activeId == null) return true;

  return !forTenant.some((s) => s.id === activeId);
}
