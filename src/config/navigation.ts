// Pure config — NO "use client". Safe to import from Server Components.
import type { ComponentType } from "react";
import type { Role } from "@/lib/roles";
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
  icon:  ComponentType<any>;
  badge?: string | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Admin (MANAGER role_code backend cũng map về slug "admin") ───────────────
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
      { title: "Configure AI",  href: "/ai/config",   icon: BrainCircuit  },
      { title: "AI Statistics", href: "/ai/stats",    icon: BarChart3     },
      { title: "AI Charts",     href: "/ai/charts",   icon: BrainCircuit  },
      { title: "Trends",        href: "/trends",      icon: TrendingUp    },
      { title: "Reports",       href: "/reports",     icon: BarChart3     },
      { title: "Audit Logs",    href: "/audit-logs",  icon: ClipboardList },
      { title: "Export Data",   href: "/export",      icon: FileDown      },
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
      { title: "Cửa hàng",      href: "/shop",         icon: Store     },
      { title: "Khách hàng",    href: "/customers",    icon: Users     },
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

// ── Inventory staff (slug inventory_staff, backend STAFF / INVENTORY_STAFF) ───
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
      { title: "Khách hàng",href: "/customers", icon: Users       },
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
  admin:            adminNav,
  shop_owner:       shopOwnerNav,
  inventory_staff:  staffNav,
  cashier:          cashierNav,
  user:             [],
};

export function getNavigationByRole(role: Role): NavSection[] {
  return NAV_MAP[role] ?? [];
}
