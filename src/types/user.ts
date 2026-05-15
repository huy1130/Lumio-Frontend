import type { Role } from "@/config/roles";

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  role_id?: number | null;
  /** Backend `roles.role_code` (vd. SHOPOWNER) */
  role_code?: string | null;
  role?: Role;
  tenant_id?: number | null;
  shop_id?: number | null;
  full_name?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
