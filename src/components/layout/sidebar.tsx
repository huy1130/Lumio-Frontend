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
import { ROLE_LABELS, ROLE_COLORS } from "@/config/roles";
import { getNavigationByRole, type NavSection } from "@/config/navigation";
import { shouldShowShopSetup } from "@/lib/ensure-shop-setup";
import { getStoredShopForTenant } from "@/lib/shop-storage";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { shopService } from "@/services/shopService";

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
              <span className="text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                Lumio
              </span>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!isCollapsed && (
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {displayName}
            </p>
            <span className={roleBadgeClass}>{ROLE_LABELS[role]}</span>
            {shopLabel && (
              <p className="mt-1.5 truncate text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {shopLabel}
              </p>
            )}
            {role === "shop_owner" && user && shouldShowShopSetup(user, tenantShopCount) && !shopLabel && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                Chưa có cửa hàng
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
          {navigation.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;
                  const linkClass = cn(
                    "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all",
                    isCollapsed && "justify-center",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
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
            "shrink-0 border-t border-gray-200 dark:border-gray-700 p-3",
            isCollapsed ? "flex justify-center" : "space-y-2",
          )}
        >
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 px-1">
                <div className={avatarClass}>{initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">
                    {email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 w-full justify-start gap-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </Button>
            </>
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
