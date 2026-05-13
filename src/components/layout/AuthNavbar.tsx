"use client";

import Link from "next/link";
import Image from "next/image";

export function AuthNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">

        {/* Logo — click về trang chủ */}
        <Link href="/" className="flex items-center gap-2 h-10">
          <Image
            src="/images/lumio-icon.png"
            alt="Lumio Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Lumio</span>
        </Link>
      </div>
    </nav>
  );
}

