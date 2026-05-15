// Shared role helpers sourced from backend auth payload (role_code, role_id).

export type Role = "admin" | "shop_owner" | "inventory_staff" | "cashier" | "user";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  shop_owner: "Shop Owner",
  inventory_staff: "Inventory Staff",
  cashier: "Cashier",
  user: "User",
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  shop_owner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  inventory_staff: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  cashier: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const REDIRECT_MAP: Record<Role, string> = {
  admin: "/dashboard",
  shop_owner: "/dashboard",
  inventory_staff: "/dashboard",
  cashier: "/dashboard",
  user: "/",
};

export const ALL_ROLES: Role[] = ["admin", "shop_owner", "inventory_staff", "cashier", "user"];

const ROLE_CODE_MAP: Record<string, Role> = {
  // Legacy aliases from older FE seeds/routes
  MANAGER: "admin",
  ADMIN: "admin",
  SHOP_OWNER: "shop_owner",
  SHOPOWNER: "shop_owner",
  INVENTORY_STAFF: "inventory_staff",
  STAFF: "inventory_staff",
  CASHIER: "cashier",
  USER: "user",
};

function normalizeRoleCode(roleCode?: string | null): string {
  if (!roleCode) return "";
  return roleCode.trim().toUpperCase().replace(/[\s-]/g, "_");
}

export function getRoleFromCode(roleCode?: string | null): Role | undefined {
  const normalized = normalizeRoleCode(roleCode);
  if (!normalized) return undefined;
  return ROLE_CODE_MAP[normalized];
}

function buildRoleIdMap(): Record<number, Role> {
  // Backend canonical IDs shared by user: role_id=[2,3,4] -> CASHIER, INVENTORY_STAFF, SHOPOWNER.
  const base: Record<number, Role> = {
    2: "cashier",
    3: "inventory_staff",
    4: "shop_owner",
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

export function getRoleFromBackend(input: {
  role?: Role | null;
  role_code?: string | null;
  role_id?: number | null;
}): Role {
  if (input.role && ALL_ROLES.includes(input.role)) return input.role;
  const roleByCode = getRoleFromCode(input.role_code);
  if (roleByCode) return roleByCode;
  return getRoleFromId(input.role_id);
}

export function getRedirectByRoleId(roleId?: number | null): string {
  return REDIRECT_MAP[getRoleFromId(roleId)] ?? "/dashboard";
}

export function getRedirectByBackendRole(input: {
  role?: Role | null;
  role_code?: string | null;
  role_id?: number | null;
}): string {
  return REDIRECT_MAP[getRoleFromBackend(input)] ?? "/dashboard";
}
