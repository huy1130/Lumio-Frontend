// Pure constants — NO "use client". Safe to import from Server Components.

export type Role = "manager" | "admin" | "shop_owner" | "staff" | "cashier" | "user";

export interface MockUser {
  name:   string;
  email:  string;
  role:   Role;
  avatar: string; // 2-letter initials
}

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

export const MOCK_USERS: Record<Role, MockUser> = {
  manager:    { name: "Nguyen Van A", email: "manager@pos.com", role: "manager",    avatar: "MA" },
  admin:      { name: "Tran Thi B",   email: "admin@pos.com",   role: "admin",      avatar: "TB" },
  shop_owner: { name: "Le Van C",     email: "owner@pos.com",   role: "shop_owner", avatar: "LC" },
  staff:      { name: "Pham Thi D",   email: "staff@pos.com",   role: "staff",      avatar: "PD" },
  cashier:    { name: "Hoang Van E",  email: "cashier@pos.com", role: "cashier",    avatar: "HE" },
  user:       { name: "Nguyen Thi F", email: "user@pos.com",    role: "user",       avatar: "NF" },
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
