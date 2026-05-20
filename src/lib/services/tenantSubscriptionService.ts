import { api } from "@/lib/api";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";

export const tenantSubscriptionService = {
  /** GET /tenants/me/subscription — gói subscription của tenant (JWT) */
  getMine(): Promise<TenantSubscriptionInfo> {
    return api.get<TenantSubscriptionInfo>("/tenants/me/subscription");
  },
};
