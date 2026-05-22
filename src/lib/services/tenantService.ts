import { api } from "@/lib/api";
import type { Tenant, UpdateTenantPayload } from "@/types";

const BASE = "/tenants";

export const tenantService = {
  /** GET /tenants */
  getAll(): Promise<Tenant[]> {
    return api.get<Tenant[]>(BASE);
  },

  /** GET /tenants/:id */
  getById(id: number): Promise<Tenant> {
    return api.get<Tenant>(`${BASE}/${id}`);
  },

  /** PATCH /tenants/:id */
  update(id: number, payload: UpdateTenantPayload): Promise<Tenant> {
    return api.patch<Tenant>(`${BASE}/${id}`, payload);
  },

  /** PATCH /tenants/:id/activate */
  activate(id: number): Promise<Tenant> {
    return api.patch<Tenant>(`${BASE}/${id}/activate`);
  },

  /** PATCH /tenants/:id/deactivate */
  deactivate(id: number): Promise<Tenant> {
    return api.patch<Tenant>(`${BASE}/${id}/deactivate`);
  },
};