import { getRoleFromId } from "@/config/roles";
import { isShopLimitReachedError } from "@/lib/shop-errors";
import { readPendingShop, clearPendingShop } from "@/lib/pending-shop";
import {
  saveShop,
  saveShopSnapshot,
  getStoredShopForTenant,
} from "@/lib/shop-storage";
import { resolveTenantShops } from "@/lib/resolve-tenant-shop";
import { shopService } from "@/services/shopService";
import type { AuthUser } from "@/types/user";

export function isShopOwnerUser(user: AuthUser): boolean {
  if (user.role_code === "SHOPOWNER") return true;
  if (user.role === "shop_owner") return true;
  return getRoleFromId(user.role_id) === "shop_owner";
}

/** Shop owner sau PayOS thường chưa có shop_id cho đến khi POST /shops */
export function needsShopSetup(user: AuthUser): boolean {
  return isShopOwnerUser(user) && user.shop_id == null;
}

/** Hiển thị form tạo shop — false khi tenant đã có shop trên DB */
export function shouldShowShopSetup(
  user: AuthUser | null,
  tenantShopCount = 0,
): boolean {
  if (!user || !isShopOwnerUser(user)) return false;
  if (tenantShopCount > 0) return false;
  if (user.shop_id != null && user.shop_id > 0) return false;
  const stored = getStoredShopForTenant(user.tenant_id);
  if (stored) return false;
  return true;
}

export type EnsureShopSetupResult =
  | { status: "ok"; user: AuthUser }
  | { status: "created"; user: AuthUser }
  | { status: "already_exists"; user: AuthUser }
  | { status: "needs_setup" };

export async function ensureShopSetup(user: AuthUser): Promise<EnsureShopSetupResult> {
  const resolved = await resolveTenantShops(user);
  if (resolved.shops.length > 0) {
    return { status: "ok", user: resolved.user };
  }

  if (!shouldShowShopSetup(user)) {
    return { status: "ok", user };
  }

  const pending = readPendingShop();
  if (!pending?.shop_name?.trim()) {
    return { status: "needs_setup" };
  }

  try {
    const shop = await shopService.create({
      shop_name: pending.shop_name.trim(),
      address: pending.address?.trim() || undefined,
      phone: pending.phone?.trim() || undefined,
    });

    clearPendingShop();
    saveShop(shop);

    return {
      status: "created",
      user: { ...user, shop_id: shop.id },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (isShopLimitReachedError(message)) {
      const again = await resolveTenantShops(user);
      if (again.shops.length > 0) {
        clearPendingShop();
        return { status: "ok", user: again.user };
      }
      clearPendingShop();
      saveShopSnapshot({
        shop_name: pending.shop_name.trim(),
        address: pending.address,
        phone: pending.phone,
        tenant_id: user.tenant_id,
      });
      return { status: "already_exists", user };
    }
    throw err;
  }
}
