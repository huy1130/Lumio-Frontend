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
  exact?: boolean;
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
      { title: "Quản lý gói", href: "/subscriptions", icon: Tag, exact: true },
      { title: "Duyệt Thanh Toán", href: "/subscriptions/requests", icon: DollarSign },
      { title: "Phân Quyền Tính Năng", href: "/plan-features", icon: Sparkles },
      { title: "Vai trò", href: "/roles", icon: Shield },
      { title: "Danh sách tenants", href: "/tenants", icon: Building2 },
      { title: "Quản lý Admin", href: "/admins", icon: UserCog },
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
      { title: "Sản phẩm", href: "/products", icon: Package },
      { title: "Nguyên liệu", href: "/ingredients", icon: FlaskConical },
      { title: "Tồn kho", href: "/inventory", icon: Warehouse },
      { title: "Ca làm việc", href: "/shifts", icon: Clock },
    ],
  },
  {
    title: "Khách hàng",
    items: [{ title: "Khách hàng", href: "/customers", icon: Users }],
  },


  {
    title: "AI",
    items: [{ title: "AI Chatbot", href: "/ai/chatbot", icon: BrainCircuit }],
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
    title: "Tra cứu",
    items: [
      { title: "Khách hàng", href: "/customers", icon: Users },
    ],
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
