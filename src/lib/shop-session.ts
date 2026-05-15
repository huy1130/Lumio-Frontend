import { setActiveShopId } from "@/lib/active-shop";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { saveShop } from "@/lib/shop-storage";
import type { Shop } from "@/types/shop";
import type { AuthUser } from "@/types/user";

/** Gắn shop đang quản lý vào session + localStorage */
export function bindActiveShopToUser(user: AuthUser, shop: Shop): AuthUser {
  if (user.tenant_id != null) {
    setActiveShopId(user.tenant_id, shop.id);
  }
  saveShop(shop);
  return { ...user, shop_id: shop.id };
}

export function resolveActiveShopFromList(
  shops: Shop[],
  user: AuthUser,
): Shop | null {
  return pickPrimaryShop(shops, user);
}
