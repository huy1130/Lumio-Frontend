import { getToken } from "@/lib/api";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";

export const tenantSubscriptionService = {
  async getMine(): Promise<TenantSubscriptionInfo> {
    const token = getToken();
    const res = await fetch("/api/tenant/subscription", {
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

    return res.json() as Promise<TenantSubscriptionInfo>;
  },
};
