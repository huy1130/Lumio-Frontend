import { AUTH_TOKEN_KEY } from "@/lib/api-client";

// CORS đã được bật ở backend → browser gọi thẳng, không cần proxy
/** Trùng cổng mặc định của Nest (`PORT ?? 3000`) và BFF `API_BACKEND_URL`. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Cùng key với AuthContext / axios api-client — trước đây dùng lumio_admin_token nên CRUD không gửi JWT. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const isPublicAdminBootstrap =
    path === "/admins/initial" || path.startsWith("/admins/initial?");

  if (token && !isPublicAdminBootstrap) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    const raw = error.message ?? `Request failed: ${res.status}`;
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body: unknown)  => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH",  body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                 => request<T>(path, { method: "DELETE" }),
};
