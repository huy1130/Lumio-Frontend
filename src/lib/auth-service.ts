import apiClient from "@/lib/api-client";
import type { AuthResponse, AuthUser } from "@/types/user";
import { getRoleFromId } from "@/config/roles";

interface AdminLoginResponse {
  accessToken: string;
  admin: {
    id: number;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  };
}

interface UserLoginResponse {
  accessToken: string;
  user: AuthUser;
}

function normalizeUser(
  user: AuthUser & { role_code?: string | null },
): AuthUser {
  const roleFromCode =
    user.role_code === "SHOPOWNER" ? ("shop_owner" as const) : undefined;
  const role = user.role ?? roleFromCode ?? getRoleFromId(user.role_id);
  return {
    ...user,
    role,
    role_code: user.role_code ?? null,
    tenant_id: user.tenant_id ?? null,
    shop_id: user.shop_id ?? null,
  };
}

function normalizeAuthResponse(payload: AdminLoginResponse | UserLoginResponse): AuthResponse {
  if ("admin" in payload) {
     const data = payload as AdminLoginResponse;
    return {
      accessToken: data.accessToken,
      user: {
         id: data.admin.id,
         email: data.admin.email,
         username: data.admin.email,
         full_name: data.admin.full_name ?? null,
         phone: data.admin.phone ?? null,
         role: "admin",
         role_id: null,
       },
    };
  }

  const data = payload as UserLoginResponse;
  return {
    accessToken: data.accessToken,
    user: normalizeUser(data.user),
  };
}

export async function adminLogin(identifier: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AdminLoginResponse>("/admins/login", {
    email: identifier,
    password,
  });

  return normalizeAuthResponse(response.data);
}

export async function userLogin(identifier: string, password: string): Promise<AuthResponse> {
  const isEmail = identifier.includes("@");
  const payload = isEmail ? { email: identifier } : { username: identifier };

  const response = await apiClient.post<UserLoginResponse>("/auth/login", {
    ...payload,
    password,
  });

  return normalizeAuthResponse(response.data);
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, newPassword });
}
