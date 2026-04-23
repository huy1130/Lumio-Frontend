"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  CreditCard,
  Settings,
  Tag,
  BarChart3,
  Store,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Admin",
    items: [
      { title: "Subscriptions", href: "/admin/subscriptions", icon: Tag },
      { title: "Products",      href: "/admin/products",      icon: Package },
      { title: "Inventory",     href: "/admin/inventory",     icon: Warehouse },
      { title: "Merchandises",  href: "/admin/merchandises",  icon: Store },
      { title: "Orders",        href: "/admin/orders",        icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Create Orders", href: "/staff/orders",      icon: ShoppingCart },
      { title: "Payments",      href: "/cashier/payments",  icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        // ── Structure ────────────────────────────────────────────────────
        "relative flex flex-col transition-all duration-300 ease-in-out",
        // ── Light / dark backgrounds ──────────────────────────────────────
        "bg-white dark:bg-gray-900",
        // ── Border ───────────────────────────────────────────────────────
        "border-r border-gray-200 dark:border-gray-700",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-gray-200 dark:border-gray-700 px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
          <Layers className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              POS System
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Management Suite
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center",
                        isActive
                          ? // ── active ──────────────────────────────────
                            "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                          : // ── idle + hover ─────────────────────────────
                            "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* section divider */}
            {!collapsed && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700" />
            )}
          </div>
        ))}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-10",
          "flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors",
          "border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-900",
          "text-gray-500 dark:text-gray-400",
          "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft  className="h-3 w-3" />}
      </button>
    </aside>
  );
}
