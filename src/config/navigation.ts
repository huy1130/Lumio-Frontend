// Pure config — NO "use client". Safe to import from Server Components.
import type { ComponentType } from "react";
import type { Role } from "@/lib/roles";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, CreditCard,
  Settings, Tag, BarChart3, Store, Users, UserCog, Building2,
  BrainCircuit, TrendingUp, ClipboardList, FileDown, DollarSign,
  Gift, ShoppingBag, UserCircle, Shield, Sparkles, FlaskConical, Clock,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
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
      { title: "Subscriptions", href: "/subscriptions", icon: Tag },
      { title: "Plan Features", href: "/plan-features", icon: Sparkles },
      { title: "Roles", href: "/roles", icon: Shield },
      { title: "Tenants", href: "/tenants", icon: Building2 },
      { title: "Users", href: "/users", icon: Users },
      { title: "Manage Admins", href: "/admins", icon: UserCog },
    ],
  },

  {
    title: "Analytics & AI",
    items: [
      { title: "Configure AI", href: "/ai/config", icon: BrainCircuit },
      { title: "AI Statistics", href: "/ai/stats", icon: BarChart3 },
      { title: "AI Charts", href: "/ai/charts", icon: BrainCircuit },
      { title: "Trends", href: "/trends", icon: TrendingUp },
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
      { title: "Export Data", href: "/export", icon: FileDown },
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
    items: [{ title: "Báo cáo", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Orders",
    items: [{ title: "Tạo đơn hàng", href: "/orders", icon: ShoppingCart }],
  },
  {
    title: "Store",
    items: [
      { title: "Cửa hàng", href: "/shop", icon: Store },
      { title: "Sản phẩm", href: "/products", icon: Package },
      { title: "Nguyên liệu", href: "/ingredients", icon: FlaskConical },
      { title: "Tồn kho", href: "/inventory", icon: Warehouse },
      { title: "Ca làm việc", href: "/shifts", icon: Clock },
    ],
  },
  {
    title: "Khuyến mãi",
    items: [{ title: "Quà Tặng", href: "/merchandises", icon: Store },
    { title: "Chương Trình", href: "/programs", icon: Gift },
    { title: "Khách hàng", href: "/customers", icon: Users },

    ],

  },


  {
    title: "System",
    items: [
      { title: "Nhân viên", href: "/cashier", icon: Users },
      { title: "Cài đặt", href: "/settings", icon: Settings }
    ],
  },
];

// ── Inventory staff (slug inventory_staff, backend STAFF / INVENTORY_STAFF) ───
const staffNav: NavSection[] = [
  {
    title: "Tổng quan",
    items: [{ title: "Báo cáo", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Tạo đơn hàng", href: "/orders", icon: ClipboardList },
    ],
  },
  {
    title: "Analytics & AI",
    items: [
      { title: "AI Charts", href: "/ai/charts", icon: BrainCircuit },
      { title: "Export Data", href: "/export", icon: FileDown },
    ],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/profile", icon: UserCircle },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

// ── Cashier ───────────────────────────────────────────────────────────────────
const cashierNav: NavSection[] = [
  {
    title: "Bán hàng",
    items: [
      { title: "Tạo đơn (POS)", href: "/orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Tổng quan",
    items: [{ title: "Báo cáo", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Tra cứu",
    items: [
      { title: "Khách hàng", href: "/customers", icon: Users },
    ],
  },
  {
    title: "AI",
    items: [{ title: "AI Chatbot", href: "/ai/chatbot", icon: BrainCircuit }],
  },
  {
    title: "System",
    items: [
      { title: "My Profile", href: "/profile", icon: UserCircle },
    ],
  },
];

// ── Lookup ────────────────────────────────────────────────────────────────────
const NAV_MAP: Record<Role, NavSection[]> = {
  admin: adminNav,
  shop_owner: shopOwnerNav,
  inventory_staff: staffNav,
  cashier: cashierNav,
  user: [],
};

export function getNavigationByRole(role: Role): NavSection[] {
  return NAV_MAP[role] ?? [];
}
