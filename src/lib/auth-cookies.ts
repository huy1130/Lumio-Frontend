import { NextResponse } from "next/server";
import type { AuthUser } from "@/types/user";
import { getRoleFromBackend, type Role } from "@/lib/roles";

/** Cookie đọc bởi middleware */
export const AUTH_ROLE_COOKIE = "lumio_role";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: COOKIE_MAX_AGE_SEC,
  sameSite: "lax" as const,
  httpOnly: true,
};

/** Gắn role lên response (login API, sync-role) */
export function applyRoleCookie(
  response: NextResponse,
  role: Role | null,
): NextResponse {
  if (!role) {
    response.cookies.delete(AUTH_ROLE_COOKIE);
    return response;
  }
  response.cookies.set(AUTH_ROLE_COOKIE, role, COOKIE_OPTIONS);
  return response;
}

export function readRoleFromCookieHeader(
  cookieHeader: string | null | undefined,
): Role | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName !== AUTH_ROLE_COOKIE) continue;
    const value = decodeURIComponent(rest.join("=")).trim();
    if (
      value === "shop_owner" ||
      value === "admin" ||
      value === "inventory_staff" ||
      value === "cashier" ||
      value === "user"
    ) {
      return value;
    }
  }

  return null;
}

export function resolveRoleFromAuthPayload(data: unknown): Role | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if ("admin" in record && record.admin) return "admin";
  if (record.user && typeof record.user === "object") {
    return getRoleFromBackend(record.user as AuthUser);
  }
  return null;
}

/** Đồng bộ cookie HttpOnly qua API (middleware không đọc được localStorage) */
export function syncAuthRoleCookie(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  const role = user ? getRoleFromBackend(user) : null;
  void fetch("/api/auth/sync-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
    credentials: "same-origin",
  }).catch(() => {
    /* ignore */
  });
}

/** Xóa cookie role trước khi redirect — tránh middleware đẩy lại /dashboard */
export async function clearAuthRoleCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    /* ignore */
  }
}
