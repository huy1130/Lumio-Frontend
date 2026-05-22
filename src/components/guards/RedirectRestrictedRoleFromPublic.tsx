"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  isPathAllowedForRestrictedRole,
  isRoleRestrictedFromPublic,
} from "@/lib/role-route-access";

/**
 * Chặn admin & shop owner ở trang public (/, /login, marketing…)
 * khi cookie chưa kịp đồng bộ sau F5.
 */
export function RedirectRestrictedRoleFromPublic({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const shouldBlock =
    !loading &&
    !!user &&
    isRoleRestrictedFromPublic(role) &&
    !isPathAllowedForRestrictedRole(role, pathname);

  useEffect(() => {
    if (shouldBlock) {
      router.replace("/dashboard");
    }
  }, [shouldBlock, router]);

  if (shouldBlock) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang chuyển về bảng điều khiển…
      </div>
    );
  }

  return <>{children}</>;
}

/** @deprecated Use RedirectRestrictedRoleFromPublic */
export const RedirectShopOwnerFromPublic = RedirectRestrictedRoleFromPublic;
