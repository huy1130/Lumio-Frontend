"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { ShopSwitcher } from "@/components/layout/ShopSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { notificationService, type ApiNotification } from "@/lib/services/notificationService";

function pathToBreadcrumb(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  return parts
    .map((p) =>
      p
        .replace(/-/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    )
    .join(" / ");
}

export function Header() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const breadcrumb = pathToBreadcrumb(pathname);

  const displayName =
    user?.full_name ?? user?.username ?? user?.email ?? "User";
  const displayEmail = user?.email ?? "";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const avatarClass = cn(
   "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
    ROLE_COLORS[role],
  );
  const spanClass = cn(
    "mt-1 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
    ROLE_COLORS[role],
  );

  function handleLogout() {
    logout();
  }

  const fetchNotifications = () => {
    if (role === "admin") return;
    notificationService.getAll()
      .then(res => setNotifications(res))
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80 sm:px-6">
      <div className="w-8 shrink-0 lg:hidden" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
          {breadcrumb}
        </p>
      </div>

      <RoleSwitcher />
      <ShopSwitcher />
      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[9px] bg-red-500 text-white animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-2">
          <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Thông báo hệ thống</span>
            {unreadCount > 0 && (
              <span className="text-[10px] text-red-500 font-medium lowercase">({unreadCount} chưa đọc)</span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500">
              Không có thông báo nào.
            </div>
          ) : (
            notifications.map((not) => (
              <DropdownMenuItem
                key={not.id}
                onClick={() => handleMarkAsRead(not.id)}
                className={cn(
                  "p-3 rounded-lg flex flex-col gap-1 items-start cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800/80 transition-all border-b border-gray-50 last:border-0 dark:border-gray-800/40",
                  !not.is_read && "bg-blue-50/20 dark:bg-blue-950/10 font-medium"
                )}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    not.severity_level === "CRITICAL" ? "bg-red-500" :
                    not.severity_level === "WARNING" ? "bg-amber-500" :
                    "bg-blue-500"
                  )} />
                  <span className={cn(
                    "text-xs font-semibold truncate",
                    not.severity_level === "CRITICAL" ? "text-red-600 dark:text-red-400" :
                    not.severity_level === "WARNING" ? "text-amber-600 dark:text-amber-400" :
                    "text-gray-800 dark:text-gray-200"
                  )}>
                    {not.title}
                  </span>
                  {!not.is_read && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pl-3.5">
                  {not.content}
                </p>
                <span className="text-[9px] text-gray-400 pl-3.5 self-start mt-1">
                  {new Date(not.created_at).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 shrink-0 rounded-full p-0">
            <div className={avatarClass}>
              {initials || displayName.slice(0, 2).toUpperCase()}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <span className={spanClass}>{ROLE_LABELS[role]}</span>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
