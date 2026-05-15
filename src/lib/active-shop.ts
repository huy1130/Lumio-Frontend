const ACTIVE_SHOP_PREFIX = "lumio_active_shop_";

export function getActiveShopId(tenantId: number | null | undefined): number | null {
  if (tenantId == null || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${ACTIVE_SHOP_PREFIX}${tenantId}`);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function setActiveShopId(
  tenantId: number | null | undefined,
  shopId: number,
): void {
  if (tenantId == null || typeof window === "undefined") return;
  try {
    localStorage.setItem(`${ACTIVE_SHOP_PREFIX}${tenantId}`, String(shopId));
  } catch {
    /* ignore */
  }
}

export function clearActiveShopForTenant(tenantId: number | null | undefined): void {
  if (tenantId == null || typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${ACTIVE_SHOP_PREFIX}${tenantId}`);
  } catch {
    /* ignore */
  }
}

export function clearAllActiveShops(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(ACTIVE_SHOP_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
