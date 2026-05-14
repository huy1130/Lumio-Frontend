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

// Update these IDs to match your roles table.
export const ROLE_ID_MAP: Record<number, Role> = {
  1: "manager",
  2: "admin",
  3: "shop_owner",
  4: "staff",
  5: "cashier",
  6: "user",
};

export function getRoleFromId(roleId?: number | null): Role {
  if (roleId == null) return "user";
  return ROLE_ID_MAP[roleId] ?? "user";
}

export function getRedirectByRoleId(roleId?: number | null): string {
  return REDIRECT_MAP[getRoleFromId(roleId)] ?? "/dashboard";
}
