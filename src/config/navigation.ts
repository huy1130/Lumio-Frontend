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
    items: [{ title: "Dashboard",      href: "/dashboard",  icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { title: "Manage Tenants", href: "/tenants",  icon: Building2 },
    ],
  },
  {
    title: "AI Config",
    items: [{ title: "Configure AI", href: "/ai/config", icon: BrainCircuit }],
  },
  {
    title: "Analytics",
    items: [
      { title: "AI Statistics", href: "/ai/stats",    icon: BarChart3     },
      { title: "Trends",        href: "/trends",      icon: TrendingUp    },
      { title: "Audit Logs",    href: "/audit-logs",  icon: ClipboardList },
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
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Admin",
    items: [
      { title: "Subscriptions", href: "/subscriptions", icon: Tag       },
      { title: "Tenants",       href: "/tenants",       icon: Building2 },
      { title: "Users",         href: "/users",         icon: Users     },
      { title: "Manage Admins", href: "/admins",        icon: UserCog   },
    ],
  },
  
  {
    title: "Analytics & AI",
    items: [
      { title: "AI Charts",   href: "/ai/charts",   icon: BrainCircuit  },
      { title: "Reports",     href: "/reports",     icon: BarChart3     },
      { title: "Audit Logs",  href: "/audit-logs",  icon: ClipboardList },
      { title: "Export Data", href: "/export",      icon: FileDown      },
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
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Store",
    items: [
      { title: "Products",      href: "/products",     icon: Package   },
      { title: "Inventory",     href: "/inventory",    icon: Warehouse },
      { title: "Merchandises",  href: "/merchandises", icon: Store     },
      { title: "Merch Program", href: "/programs",     icon: Gift      },
    ],
  },
  {
    title: "Orders",
    items: [{ title: "Orders", href: "/orders", icon: ShoppingCart }],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "Financial Stats", href: "/financials",  icon: DollarSign    },
      { title: "AI Charts",       href: "/ai/charts",   icon: BrainCircuit  },
      { title: "Reports",         href: "/reports",     icon: BarChart3     },
      { title: "Audit Logs",      href: "/audit-logs",  icon: ClipboardList },
      { title: "Export Data",     href: "/export",      icon: FileDown      },
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
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Create Orders", href: "/orders", icon: ClipboardList },
    ],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "AI Charts",   href: "/ai/charts", icon: BrainCircuit },
      { title: "Export Data", href: "/export",    icon: FileDown     },
    ],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/profile",  icon: UserCircle },
      { title: "Settings",   href: "/settings", icon: Settings   },
    ],
  },
];

// ── Cashier ───────────────────────────────────────────────────────────────────
const cashierNav: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Payments",  href: "/payments",  icon: CreditCard  },
      { title: "Checkout",  href: "/checkout",  icon: ShoppingBag },
      { title: "Customers", href: "/customers", icon: Users       },
    ],
  },
  {
    title: "AI",
    items: [{ title: "AI Chatbot", href: "/ai/chatbot", icon: BrainCircuit }],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/profile",  icon: UserCircle },
      { title: "Settings",   href: "/settings", icon: Settings   },
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
  user:       [],
};

export function getNavigationByRole(role: Role): NavSection[] {
  return NAV_MAP[role] ?? [];
}
