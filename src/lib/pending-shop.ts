const STORAGE_KEY = "lumio_pending_shop";

export interface PendingShopSetup {
  shop_name: string;
  address?: string;
  phone?: string;
}

export function savePendingShop(data: PendingShopSetup): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readPendingShop(): PendingShopSetup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingShopSetup;
    if (!parsed?.shop_name?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingShop(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
