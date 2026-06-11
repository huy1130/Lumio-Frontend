"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import { getNavigationByRole, type NavSection } from "@/config/navigation";
import { shouldShowShopSetup } from "@/lib/ensure-shop-setup";
import { getStoredShopForTenant } from "@/lib/shop-storage";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { shopService } from "@/lib/services/shopService";

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [shopLabel, setShopLabel] = useState<string | null>(null);
  const [tenantShopCount, setTenantShopCount] = useState(0);

  useEffect(() => {
    if (role !== "shop_owner" || !user) {
      setShopLabel(null);
      setTenantShopCount(0);
      return;
    }

    const stored = getStoredShopForTenant(user.tenant_id);
    if (stored?.shop_name) {
      setShopLabel(stored.shop_name);
    }

    let cancelled = false;
    shopService
      .getMine()
      .then((list) => {
        if (cancelled) return;
        const forTenant = list.filter((s) => s.tenant_id === user.tenant_id);
        setTenantShopCount(forTenant.length);
        const primary = pickPrimaryShop(forTenant, user);
        if (primary?.shop_name) setShopLabel(primary.shop_name);
      })
      .catch(() => {
        if (!cancelled && stored?.shop_name) setShopLabel(stored.shop_name);
      });

    return () => {
      cancelled = true;
    };
  }, [role, user, pathname]);

  const navigation: NavSection[] = getNavigationByRole(role).map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.href !== "/shop" || role !== "shop_owner") return item;
      if (user && shouldShowShopSetup(user, tenantShopCount)) {
        return { ...item, badge: "!" };
      }
      return item;
    }),
  }));

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
  }

  const displayName = user?.full_name || user?.username || user?.email || "";
  const email = user?.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || email.slice(0, 2).toUpperCase();

  const roleBadgeClass = cn(
    "mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
    ROLE_COLORS[role],
  );
  const avatarClass = cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
    ROLE_COLORS[role],
  );

  function NavContent({ isCollapsed }: { isCollapsed: boolean }) {
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-700 px-4",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          {isCollapsed ? (
            <Image
              src="/images/lumio-icon.png"
              alt="Lumio Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Image
                src="/images/lumio-icon.png"
                alt="Lumio Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                Lumio
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigation.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;
                  const linkClass = cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-all",
                    isCollapsed && "justify-center",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                      : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  );
                  const iconClass = cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500",
                  );
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          console.log("[Sidebar Link Clicked]", {
                            title: item.title,
                            href: item.href,
                            currentRole: role,
                            currentPathname: pathname
                          });
                        }}
                        title={isCollapsed ? item.title : undefined}
                        className={linkClass}
                      >
                        <Icon className={iconClass} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">
                              {item.title}
                            </span>
                            {item.badge !== undefined && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
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
              {!isCollapsed && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-800" />
              )}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div
          className={cn(
            "shrink-0 border-t border-gray-200 dark:border-gray-700 p-4",
            isCollapsed && "flex justify-center",
          )}
        >
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={avatarClass}>{initials}</div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-gray-100">
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {ROLE_LABELS[role]}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const desktopClass = cn(
    "relative hidden flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 lg:flex",
    collapsed ? "w-[68px]" : "w-64",
  );
  const drawerClass = cn(
    "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900 lg:hidden",
    mobileOpen ? "translate-x-0" : "-translate-x-full",
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:hidden"
      >
        <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={drawerClass}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
        <NavContent isCollapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={desktopClass}>
        <NavContent isCollapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[4.5rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-500" />
          )}
        </button>
      </aside>
    </>
  );
}
