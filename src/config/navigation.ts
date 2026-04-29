// Pure config — NO "use client". Safe to import from Server Components.
import type { Role } from "@/config/roles";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, CreditCard,
  Settings, Tag, BarChart3, Store, Users, UserCog, Building2,
  BrainCircuit, TrendingUp, ClipboardList, FileDown, DollarSign,
  Gift, ShoppingBag, UserCircle,
} from "lucide-react";

export interface NavItem {
  title: string;
  href:  string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon:  React.ComponentType<any>;
  badge?: string | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Manager ───────────────────────────────────────────────────────────────────
const managerNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard",        href: "/manager/dashboard",  icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { title: "Manage Admins",  href: "/manager/admins",   icon: UserCog   },
      { title: "Manage Tenants", href: "/manager/tenants",  icon: Building2 },
    ],
  },
  {
    title: "AI Config",
    items: [{ title: "Configure AI", href: "/manager/ai-config", icon: BrainCircuit }],
  },
  {
    title: "Analytics",
    items: [
      { title: "AI Statistics",      href: "/manager/ai-stats",   icon: BarChart3     },
      { title: "Trends",             href: "/manager/trends",     icon: TrendingUp    },
      { title: "Audit Logs",         href: "/manager/audit-logs", icon: ClipboardList },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

// ── Admin ─────────────────────────────────────────────────────────────────────
const adminNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Admin",
    items: [
      { title: "Subscriptions", href: "/admin/subscriptions", icon: Tag       },
      { title: "Tenants",       href: "/admin/tenants",       icon: Building2 },
      { title: "Users",         href: "/admin/users",         icon: Users     },
    ],
  },
  {
    title: "Store",
    items: [
      { title: "Products",     href: "/admin/products",     icon: Package   },
      { title: "Inventory",    href: "/admin/inventory",    icon: Warehouse },
      { title: "Merchandises", href: "/admin/merchandises", icon: Store     },
    ],
  },
  {
    title: "Operations",
    items: [{ title: "Orders", href: "/admin/orders", icon: ShoppingCart }],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "AI Charts",   href: "/admin/ai-charts",   icon: BrainCircuit  },
      { title: "Reports",     href: "/admin/reports",     icon: BarChart3     },
      { title: "Audit Logs",  href: "/admin/audit-logs",  icon: ClipboardList },
      { title: "Export Data", href: "/admin/export",      icon: FileDown      },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

// ── Shop Owner ────────────────────────────────────────────────────────────────
const shopOwnerNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/shop-owner/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Store",
    items: [
      { title: "Products",       href: "/shop-owner/products",       icon: Package   },
      { title: "Inventory",      href: "/shop-owner/inventory",      icon: Warehouse },
      { title: "Merchandises",   href: "/shop-owner/merchandises",   icon: Store     },
      { title: "Merch Program",  href: "/shop-owner/merch-programs", icon: Gift      },
    ],
  },
  {
    title: "Orders",
    items: [{ title: "Orders", href: "/shop-owner/orders", icon: ShoppingCart }],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "Financial Stats", href: "/shop-owner/financials",  icon: DollarSign    },
      { title: "AI Charts",       href: "/shop-owner/ai-charts",   icon: BrainCircuit  },
      { title: "Reports",         href: "/shop-owner/reports",     icon: BarChart3     },
      { title: "Audit Logs",      href: "/shop-owner/audit-logs",  icon: ClipboardList },
      { title: "Export Data",     href: "/shop-owner/export",      icon: FileDown      },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

// ── Staff ─────────────────────────────────────────────────────────────────────
const staffNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Create Orders", href: "/staff/orders", icon: ClipboardList },
    ],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "AI Charts",   href: "/staff/ai-charts", icon: BrainCircuit },
      { title: "Export Data", href: "/staff/export",    icon: FileDown     },
    ],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/staff/profile", icon: UserCircle },
      { title: "Settings",   href: "/settings",      icon: Settings   },
    ],
  },
];

// ── Cashier ───────────────────────────────────────────────────────────────────
const cashierNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/cashier/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Payments",  href: "/cashier/payments",  icon: CreditCard  },
      { title: "Checkout",  href: "/cashier/checkout",  icon: ShoppingBag },
      { title: "Customers", href: "/cashier/customers", icon: Users       },
    ],
  },
  {
    title: "AI",
    items: [{ title: "AI Chatbot", href: "/cashier/ai-chatbot", icon: BrainCircuit }],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/cashier/profile", icon: UserCircle },
      { title: "Settings",   href: "/settings",        icon: Settings   },
    ],
  },
];

// ── Lookup ────────────────────────────────────────────────────────────────────
const NAV_MAP: Record<Role, NavSection[]> = {
  manager:    managerNav,
  admin:      adminNav,
  shop_owner: shopOwnerNav,
  staff:      staffNav,
  cashier:    cashierNav,
};

export function getNavigationByRole(role: Role): NavSection[] {
  return NAV_MAP[role] ?? [];
}
