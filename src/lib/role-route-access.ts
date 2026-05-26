import type { Role } from "@/lib/roles";

/** Role chỉ được ở khu quản lý — không vào marketing / login / onboarding */
export const ROLES_RESTRICTED_FROM_PUBLIC: Role[] = ["shop_owner", "admin"];

function matchPathPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  return pathname.startsWith(`${prefix}/`);
}

function isAllowed(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => matchPathPrefix(pathname, prefix));
}

/** Khớp menu admin (platform quản lý) */
export const ADMIN_ALLOWED_PATH_PREFIXES = [
  "/dashboard",
  "/settings",
  "/subscriptions",
  "/plan-features",
  "/roles",
  "/tenants",
  "/users",
  "/admins",
  "/ai/config",
  "/ai/stats",
  "/ai/charts",
  "/trends",
  "/reports",
  "/audit-logs",
  "/export",
] as const;

/** Khớp menu shop owner + PayOS callback */
export const SHOP_OWNER_ALLOWED_PATH_PREFIXES = [
  "/dashboard",
  "/settings",
  "/shop",
  "/select-shop",
  "/subscription/renew",
  "/subscription/success",
  "/subscription/cancel",
  "/orders",
  "/products",
  "/product-categories",
  "/ingredients",
  "/inventory",
  "/customers",
  "/merchandises",
  "/programs",
  "/financials",
  "/reports",
  "/audit-logs",
  "/export",
  "/ai/charts",
] as const;

export function isPathAllowedForAdmin(pathname: string): boolean {
  return isAllowed(pathname, ADMIN_ALLOWED_PATH_PREFIXES);
}

export function isPathAllowedForShopOwner(pathname: string): boolean {
  return isAllowed(pathname, SHOP_OWNER_ALLOWED_PATH_PREFIXES);
}

export function isPathAllowedForRestrictedRole(
  role: Role,
  pathname: string,
): boolean {
  if (role === "admin") return isPathAllowedForAdmin(pathname);
  if (role === "shop_owner") return isPathAllowedForShopOwner(pathname);
  return true;
}

export function isRoleRestrictedFromPublic(role: Role): boolean {
  return ROLES_RESTRICTED_FROM_PUBLIC.includes(role);
}
