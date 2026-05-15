import { isShopOwnerUser } from "@/lib/ensure-shop-setup";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { bindActiveShopToUser } from "@/lib/shop-session";
import {
  clearStoredShop,
  clearStoredShopIfWrongTenant,
  getStoredShopForTenant,
  markTenantHasShop,
} from "@/lib/shop-storage";
import { clearAllActiveShops } from "@/lib/active-shop";
import { shopService } from "@/lib/services/shopService";
import type { Shop } from "@/types/shop";
import type { AuthUser } from "@/types/user";

/** Tải shops theo tenant_id (BFF) và đồng bộ session + localStorage */
export async function resolveTenantShops(
  user: AuthUser,
): Promise<{ shops: Shop[]; user: AuthUser }> {
  if (!isShopOwnerUser(user) || user.tenant_id == null) {
    return { shops: [], user };
  }

  clearStoredShopIfWrongTenant(user.tenant_id);

  try {
    const shops = await shopService.getMine();
    const forTenant = shops.filter((s) => s.tenant_id === user.tenant_id);

    if (forTenant.length === 0) {
      return { shops: [], user };
    }

    const primary = pickPrimaryShop(forTenant, user);
    if (!primary) {
      return { shops: [], user };
    }

    markTenantHasShop();

    return {
      shops: forTenant,
      user: bindActiveShopToUser(user, primary),
    };
  } catch (err) {
    const cached = getStoredShopForTenant(user.tenant_id);
    if (cached) {
      return {
        shops: [cached],
        user: bindActiveShopToUser(user, cached),
      };
    }
    throw err;
  }
}

/** Sau logout / đổi tài khoản */
export function clearShopSessionCache(): void {
  clearStoredShop();
  clearAllActiveShops();
}
