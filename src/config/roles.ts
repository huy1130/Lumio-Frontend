// Pure constants — NO "use client". Safe to import from Server Components.

export type Role = "manager" | "admin" | "shop_owner" | "staff" | "cashier" | "user";

export const ROLE_LABELS: Record<Role, string> = {
  manager:    "Manager",
  admin:      "Admin",
  shop_owner: "Shop Owner",
  staff:      "Staff",
  cashier:    "Cashier",
  user:       "User",
};

export const ROLE_COLORS: Record<Role, string> = {
  manager:    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  admin:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  shop_owner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  staff:      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  cashier:    "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  user:       "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const REDIRECT_MAP: Record<Role, string> = {
  manager:    "/dashboard",
  admin:      "/dashboard",
  shop_owner: "/dashboard",
  staff:      "/dashboard",
  cashier:    "/dashboard",
  user:       "/",
};

export const ALL_ROLES: Role[] = ["manager", "admin", "shop_owner", "staff", "cashier", "user"];

/**
 * Map `users.role_id` → UI role.
 * Backend dùng `roles.id` tự tăng: role `SHOPOWNER` (đăng ký / PayOS) thường là hàng thứ 4 → id 4,
 * không phải “staff”. Các `role_id` khác (vd. staff) dùng `NEXT_PUBLIC_ROLE_ID_MAP_JSON`
 * để map đúng với bảng `roles` của bạn.
 */
function buildRoleIdMap(): Record<number, Role> {
  const base: Record<number, Role> = {
    1: "manager",
    2: "admin",
    3: "shop_owner",
    4: "shop_owner",
    5: "cashier",
    6: "user",
  };
  const raw = process.env.NEXT_PUBLIC_ROLE_ID_MAP_JSON;
  if (!raw?.trim()) return base;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const merged = { ...base };
    for (const [idStr, slug] of Object.entries(parsed)) {
      const id = Number(idStr);
      if (!Number.isFinite(id) || !ALL_ROLES.includes(slug as Role)) continue;
      merged[id] = slug as Role;
    }
    return merged;
  } catch {
    return base;
  }
}

export const ROLE_ID_MAP: Record<number, Role> = buildRoleIdMap();

export function getRoleFromId(roleId?: number | null): Role {
  if (roleId == null) return "user";
  return ROLE_ID_MAP[roleId] ?? "user";
}

export function getRedirectByRoleId(roleId?: number | null): string {
  return REDIRECT_MAP[getRoleFromId(roleId)] ?? "/dashboard";
}
