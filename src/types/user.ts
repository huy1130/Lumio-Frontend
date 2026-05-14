import type { Role } from "@/config/roles";

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  role_id?: number | null;
  role?: Role;
  full_name?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
