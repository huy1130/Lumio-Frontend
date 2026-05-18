import type { Role } from "@/lib/roles";

/**
 * Maps each feature route (relative to /dashboard root) to the roles
 * that are allowed to access it. Used by AccessGuard on every feature page.
 */
export const FEATURE_ACCESS: Record<string, Role[]> = {
  dashboard: ["admin", "shop_owner", "inventory_staff", "cashier"],
  shop: ["shop_owner"],
  products: ["admin", "shop_owner"],
  inventory: ["admin", "shop_owner"],
  orders: ["admin", "shop_owner", "inventory_staff"],
  merchandises: ["admin", "shop_owner"],
  "audit-logs": ["admin", "shop_owner"],
  users: ["admin"],
  subscriptions: ["admin"],
  tenants: ["admin"],
  admins: ["admin"],
  reports: ["admin", "shop_owner"],
  export: ["admin", "shop_owner", "inventory_staff"],
  financials: ["shop_owner"],
  programs: ["shop_owner"],
  trends: ["admin"],
  payments: ["cashier"],
  checkout: ["cashier"],
  customers: ["admin", "shop_owner", "cashier"],
  profile: ["inventory_staff", "cashier"],
  settings: ["admin", "shop_owner", "inventory_staff", "cashier"],
  "ai/charts": ["admin", "shop_owner", "inventory_staff"],
  "ai/config": ["admin"],
  "ai/stats": ["admin"],
  "ai/chatbot": ["cashier"],
};
