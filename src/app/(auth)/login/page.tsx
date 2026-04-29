"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ALL_ROLES, ROLE_LABELS, ROLE_COLORS, MOCK_USERS, REDIRECT_MAP } from "@/config/roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/config/roles";

export default function LoginPage() {
  const { setRole } = useAuth();
  const router = useRouter();

  function handleSelect(role: Role) {
    setRole(role);
    router.push(REDIRECT_MAP[role]);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
          <p className="mt-1 text-gray-500">Chọn role để xem demo giao diện</p>
        </div>

        {/* Role cards */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-100">
          {ALL_ROLES.map((role, idx) => {
            const user = MOCK_USERS[role];
            return (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className={cn(
                  "flex w-full items-center gap-4 px-5 py-4 transition-all hover:bg-gray-50 active:scale-[0.99]",
                  idx < ALL_ROLES.length - 1 && "border-b border-gray-100"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  ROLE_COLORS[role]
                )}>
                  {user.avatar}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                </div>

                {/* Role badge */}
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  ROLE_COLORS[role]
                )}>
                  {ROLE_LABELS[role]}
                </span>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Demo note */}
        <p className="mt-6 text-center text-sm text-gray-400">
          🚀 Demo mode — không cần password
        </p>
      </div>
    </div>
  );
}
