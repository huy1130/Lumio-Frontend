import { api } from "@/lib/api";
import type {
  ApiAdmin,
  AdminLoginResponse,
  CreateAdminPayload,
  UpdateAdminPayload,
} from "@/types";

const BASE = "/admins";

export const adminService = {
  /** POST /admins/login — public, no auth required */
  login(email: string, password: string): Promise<AdminLoginResponse> {
    return api.post<AdminLoginResponse>(`${BASE}/login`, { email, password });
  },

  /** POST /admins/initial — bootstrap first admin, no auth required */
  createInitial(payload: CreateAdminPayload): Promise<ApiAdmin> {
    return api.post<ApiAdmin>(`${BASE}/initial`, payload);
  },

  /** POST /admins — requires JWT + AdminOnly */
  create(payload: CreateAdminPayload): Promise<ApiAdmin> {
    return api.post<ApiAdmin>(BASE, payload);
  },

  /** GET /admins — requires JWT + AdminOnly */
  getAll(): Promise<ApiAdmin[]> {
    return api.get<ApiAdmin[]>(BASE);
  },

  /** PATCH /admins/:id — requires JWT + AdminOnly */
  update(id: number, payload: UpdateAdminPayload): Promise<ApiAdmin> {
    return api.patch<ApiAdmin>(`${BASE}/${id}`, payload);
  },

  /** PATCH /admins/:id/activate — requires JWT + AdminOnly */
  activate(id: number): Promise<ApiAdmin> {
    return api.patch<ApiAdmin>(`${BASE}/${id}/activate`);
  },

  /** PATCH /admins/:id/deactivate — requires JWT + AdminOnly */
  deactivate(id: number): Promise<ApiAdmin> {
    return api.patch<ApiAdmin>(`${BASE}/${id}/deactivate`);
  },
};
