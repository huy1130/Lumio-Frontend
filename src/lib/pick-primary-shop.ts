import type { Shop } from "@/types/shop";
import type { AuthUser } from "@/types/user";

/** Chọn shop thuộc tenant — ưu tiên user.shop_id nếu có trong danh sách */
export function pickPrimaryShop(shops: Shop[], user: AuthUser): Shop | null {
  if (shops.length === 0) return null;

  const forTenant =
    user.tenant_id != null
      ? shops.filter((s) => s.tenant_id === user.tenant_id)
      : shops;

  if (forTenant.length === 0) return null;

  if (user.shop_id != null && user.shop_id > 0) {
    const linked = forTenant.find((s) => s.id === user.shop_id);
    if (linked) return linked;
  }

  return forTenant[0];
}
