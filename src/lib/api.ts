import { AUTH_TOKEN_KEY } from "@/lib/api-client";

// CORS đã được bật ở backend → browser gọi thẳng, không cần proxy
/** Trùng cổng mặc định của Nest (`PORT ?? 3000`) và BFF `API_BACKEND_URL`. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Cùng key với AuthContext / axios (`lumio_access_token`). */
const TOKEN_KEY = AUTH_TOKEN_KEY;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
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
