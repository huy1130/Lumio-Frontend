import { api } from "@/lib/api";
import type { ApiRole, CreateRolePayload, UpdateRolePayload } from "@/types";

const BASE = "/roles";

export const roleService = {
  getAll(): Promise<ApiRole[]> {
    return api.get<ApiRole[]>(BASE);
  },

  getById(id: number): Promise<ApiRole> {
    return api.get<ApiRole>(`${BASE}/${id}`);
  },

  create(payload: CreateRolePayload): Promise<ApiRole> {
    return api.post<ApiRole>(BASE, payload);
  },

  update(id: number, payload: UpdateRolePayload): Promise<ApiRole> {
    return api.patch<ApiRole>(`${BASE}/${id}`, payload);
  },

  delete(id: number): Promise<void> {
    return api.delete<void>(`${BASE}/${id}`);
  },
};
