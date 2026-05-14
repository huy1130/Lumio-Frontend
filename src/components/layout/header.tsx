"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/config/roles";
import { cn } from "@/lib/utils";

function pathToBreadcrumb(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  return parts
    .map((p) => p.replace(/-/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    .join(" / ");
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, apiAdmin, isRealAdmin, logoutAdmin } = useAuth();

  const breadcrumb = pathToBreadcrumb(pathname);

  // Nếu đang login bằng tài khoản admin thật thì dùng data từ API
  const displayName  = isRealAdmin
    ? (apiAdmin?.full_name ?? apiAdmin?.email ?? "Admin")
    : user.name;
  const displayEmail = isRealAdmin ? (apiAdmin?.email ?? "") : user.email;

  // Avatar: ảnh thật nếu có, không thì lấy 2 chữ cái đầu
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const avatarClass = cn(
    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold overflow-hidden",
    isRealAdmin ? "bg-indigo-600 text-white" : ROLE_COLORS[role],
  );
  const spanClass = cn(
    "mt-1 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
    isRealAdmin ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : ROLE_COLORS[role],
  );

  function handleLogout() {
    logoutAdmin();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80 sm:px-6">
      <div className="w-8 shrink-0 lg:hidden" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
          {breadcrumb}
        </p>
      </div>

      <div className="relative hidden w-52 md:flex lg:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="h-9 pl-9 text-sm" />
      </div>

      <RoleSwitcher />
      <ThemeToggle />

      <Button variant="ghost" size="icon" className="relative shrink-0 text-muted-foreground">
        <Bell className="h-4 w-4" />
        <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[9px]">
          3
        </Badge>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 shrink-0 rounded-full p-0">
            <div className={avatarClass}>
              {isRealAdmin && apiAdmin?.avatar
                ? <img src={apiAdmin.avatar} alt={displayName} className="h-full w-full object-cover" />
                : isRealAdmin
                ? initials
                : user.avatar}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <span className={spanClass}>
                {isRealAdmin
                  ? apiAdmin?.manager_id === null ? "Super Admin" : "Admin"
                  : ROLE_LABELS[role]}
              </span>
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
