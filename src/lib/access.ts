import type { Role } from "@/config/roles";

/**
 * Maps each feature route (relative to /dashboard root) to the roles
 * that are allowed to access it. Used by AccessGuard on every feature page.
 */
export const FEATURE_ACCESS: Record<string, Role[]> = {
  dashboard:     ["manager", "admin", "shop_owner", "staff", "cashier"],
  products:      ["admin", "shop_owner"],
  inventory:     ["admin", "shop_owner"],
  orders:        ["admin", "shop_owner", "staff"],
  merchandises:  ["admin", "shop_owner"],
  "audit-logs":  ["admin", "manager", "shop_owner"],
  users:         ["admin"],
  subscriptions: ["admin"],
  tenants:       ["admin", "manager"],
  admins:        ["admin"],
  reports:       ["admin", "shop_owner"],
  export:        ["admin", "shop_owner", "staff"],
  financials:    ["shop_owner"],
  programs:      ["shop_owner"],
  trends:        ["manager"],
  payments:      ["cashier"],
  checkout:      ["cashier"],
  customers:     ["cashier"],
  profile:       ["staff", "cashier"],
  settings:      ["manager", "admin", "shop_owner", "staff", "cashier"],
  "ai/charts":   ["admin", "shop_owner", "staff"],
  "ai/config":   ["manager"],
  "ai/stats":    ["manager"],
  "ai/chatbot":  ["cashier"],
};
