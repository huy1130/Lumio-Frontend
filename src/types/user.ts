import type { Role } from "@/lib/roles";

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  role_id?: number | null;
  role_code?: string | null;
  role?: Role;
  full_name?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
