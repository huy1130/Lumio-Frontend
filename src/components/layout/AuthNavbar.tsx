"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AuthNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo — click về trang chủ */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4EE8]">
            <Layers className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            Lumio
          </span>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
