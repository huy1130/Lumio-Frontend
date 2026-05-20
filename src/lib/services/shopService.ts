import { api } from "@/lib/api";
import type { CreateShopPayload, Shop } from "@/types/shop";
import type { ShopQuota } from "@/types/shop-quota";

/** Nest: ShopController @Controller('shops') — JWT, tenant_id từ token */
export const shopService = {
  create(payload: CreateShopPayload): Promise<Shop> {
    return api.post<Shop>("/shops", payload);
  },

  /** GET /shops/mine — shops của tenant đang đăng nhập */
  getMine(): Promise<Shop[]> {
    return api.get<Shop[]>("/shops/mine");
  },

  /** GET /shops/quota — MAX_SHOPS theo gói subscription active */
  getQuota(): Promise<ShopQuota> {
    return api.get<ShopQuota>("/shops/quota");
  },
};
