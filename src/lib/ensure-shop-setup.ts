import { getRoleFromBackend } from "@/lib/roles";
import { needsShopSelection, pickPrimaryShop } from "@/lib/pick-primary-shop";
import { getStoredShopForTenant } from "@/lib/shop-storage";
import { bindActiveShopToUser } from "@/lib/shop-session";
import { resolveTenantShops } from "@/lib/resolve-tenant-shop";
import type { AuthUser } from "@/types/user";

export function isShopOwnerUser(user: AuthUser): boolean {
  return getRoleFromBackend(user) === "shop_owner";
}

export function needsShopSetup(user: AuthUser): boolean {
  return isShopOwnerUser(user) && user.shop_id == null;
}

/** Form tạo shop đầu tiên — khi chưa có shop trên DB */
export function shouldShowShopSetup(
  user: AuthUser | null,
  tenantShopCount = 0,
): boolean {
  if (!user || !isShopOwnerUser(user)) return false;
  return tenantShopCount === 0;
}

export type ShopOwnerLoginStatus = "ready" | "needs_setup" | "needs_select";

/**
 * Sau login: không POST /shops — chỉ định tuyến setup / chọn shop / dashboard.
 */
export async function resolveShopOwnerAfterLogin(
  user: AuthUser,
): Promise<{ status: ShopOwnerLoginStatus; user: AuthUser }> {
  const resolved = await resolveTenantShops(user);
  const shops = resolved.shops;

  if (shops.length === 0) {
    if (shouldShowShopSetup(user, 0)) {
      return { status: "needs_setup", user: resolved.user };
    }
    return { status: "ready", user: resolved.user };
  }

  if (needsShopSelection(shops, user)) {
    return { status: "needs_select", user: resolved.user };
  }

  const primary = pickPrimaryShop(shops, user);
  if (primary) {
    return {
      status: "ready",
      user: bindActiveShopToUser(resolved.user, primary),
    };
  }

  return { status: "ready", user: resolved.user };
}
