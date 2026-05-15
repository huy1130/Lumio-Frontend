import type { Shop } from "@/types/shop";

const STORAGE_KEY = "lumio_current_shop";
const TENANT_HAS_SHOP_KEY = "lumio_tenant_has_shop";

export interface ShopSnapshotInput {
  shop_name: string;
  address?: string;
  phone?: string;
  tenant_id?: number | null;
}

export function saveShop(shop: Shop): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shop));
  } catch {
    /* ignore */
  }
}

export function getStoredShop(): Shop | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Shop;
  } catch {
    return null;
  }
}

/** Cache local chỉ dùng khi cùng tenant với user đang đăng nhập */
export function getStoredShopForTenant(tenantId: number | null | undefined): Shop | null {
  const shop = getStoredShop();
  if (!shop || tenantId == null) return null;
  if (shop.tenant_id !== tenantId) return null;
  if (!shop.id || shop.id <= 0) return null;
  return shop;
}

export function clearStoredShopIfWrongTenant(
  tenantId: number | null | undefined,
): void {
  const shop = getStoredShop();
  if (!shop?.tenant_id || tenantId == null) return;
  if (shop.tenant_id !== tenantId) clearStoredShop();
}

export function clearStoredShop(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TENANT_HAS_SHOP_KEY);
  } catch {
    /* ignore */
  }
}

/** Tenant đã có shop trên server (users.shop_id có thể vẫn null) */
export function markTenantHasShop(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TENANT_HAS_SHOP_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function tenantHasShop(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TENANT_HAS_SHOP_KEY) === "1";
  } catch {
    return false;
  }
}

/** Lưu snapshot khi biết shop đã tồn tại nhưng không có GET /shops */
export function saveShopSnapshot(input: ShopSnapshotInput): Shop {
  const now = new Date().toISOString();
  const shop: Shop = {
    id: 0,
    tenant_id: input.tenant_id ?? 0,
    shop_name: input.shop_name,
    address: input.address ?? null,
    phone: input.phone ?? null,
    is_active: true,
    created_at: now,
    update_at: now,
  };
  saveShop(shop);
  markTenantHasShop();
  try {
    sessionStorage.setItem("lumio_shop_limit_hit", "1");
  } catch {
    /* ignore */
  }
  return shop;
}
