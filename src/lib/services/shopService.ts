import { api, getToken } from "@/lib/api";
import type { CreateShopPayload, Shop } from "@/types/shop";
import type { ShopQuota } from "@/types/shop-quota";

/** Nest: ShopController @Controller('shops') + @Post() — JWT, tenant_id từ token */
export const shopService = {
  create(payload: CreateShopPayload): Promise<Shop> {
    return api.post<Shop>("/shops", payload);
  },

  /** BFF: shops WHERE tenant_id = JWT.tenant_id (cùng DB với Nest POST /shops) */
  async getMine(): Promise<Shop[]> {
    const token = getToken();
    const res = await fetch("/api/shops/mine", {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const raw = (body as { message?: string }).message ?? res.statusText;
      throw new Error(raw);
    }

    return res.json() as Promise<Shop[]>;
  },

  /** BFF: MAX_SHOPS theo tenant_subscriptions + subscription_features */
  async getQuota(): Promise<ShopQuota> {
    const token = getToken();
    const res = await fetch("/api/shops/quota", {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const raw = (body as { message?: string }).message ?? res.statusText;
      throw new Error(raw);
    }

    return res.json() as Promise<ShopQuota>;
  },
};
