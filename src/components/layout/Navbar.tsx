"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Tính năng", href: "/features" },
  { label: "Giá thành", href: "/pricing" },
  { label: "Về chúng tôi", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";

  // navbar có background khi không ở trang chủ (các marketing sub-pages có bg màu)
  const navBg = isHome
    ? "border-transparent bg-transparent"
    : "border-b border-gray-200/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl";

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        navBg,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 h-10">
          <Image
            src="/images/lumio-icon.png"
            alt="Lumio Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Lumio
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/8",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {/* Login — filled when active */}
          <Link href="/login" className="hidden md:block">
            <Button
              variant={pathname === "/login" ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-200",
                pathname === "/login"
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-sm"
                  : "border-gray-400/60 dark:border-gray-500/60 bg-white/20 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/20 backdrop-blur-sm",
              )}
            >
              Đăng nhập
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 py-3 space-y-1 md:hidden">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                )}
                {label}
              </Link>
            );
          })}

          <div className="pt-2 pb-1 flex gap-2">
            <Link
              href="/login"
              className="flex-1"
              onClick={() => setMobileOpen(false)}
            >
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full transition-all",
                  pathname === "/login" &&
                    "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400",
                )}
              >
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
