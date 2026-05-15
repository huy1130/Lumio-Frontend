import type { AuthResponse, AuthUser } from "@/types/user";
import { getRoleFromBackend } from "@/lib/roles";

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

function normalizeUser(user: AuthUser): AuthUser {
  const role = getRoleFromBackend(user);
  return {
    ...user,
    role,
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

async function postAuthProxy<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const rawMessage = (data as { message?: string | string[] } | undefined)?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage || "Authentication request failed";
    throw new Error(String(message));
  }

  return data as T;
}

export async function adminLogin(identifier: string, password: string): Promise<AuthResponse> {
  const response = await postAuthProxy<AdminLoginResponse>("/api/auth/admin/login", {
    email: identifier,
    password,
  });

  return normalizeAuthResponse(response);
}

export async function userLogin(identifier: string, password: string): Promise<AuthResponse> {
  const isEmail = identifier.includes("@");
  const payload = isEmail ? { email: identifier } : { username: identifier };

  const response = await postAuthProxy<UserLoginResponse>("/api/auth/login", {
    ...payload,
    password,
  });

  return normalizeAuthResponse(response);
}

export async function forgotPassword(email: string): Promise<void> {
  await postAuthProxy("/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await postAuthProxy("/api/auth/reset-password", { token, newPassword });
}
