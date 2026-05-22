import type { ApiAdmin } from "@/types";
import type { AuthUser } from "@/types/user";

/** Initial admin: manager_id === null (khớp backend ensureInitialAdmin). */
export function isInitialAdminRecord(admin: Pick<ApiAdmin, "manager_id">): boolean {
  return admin.manager_id === null;
}

export function canManageAdmins(
  user: AuthUser | null,
  admins: ApiAdmin[] = [],
): boolean {
  if (!user) return false;
  if (user.manager_id === null) return true;
  if (typeof user.manager_id === "number") return false;
  const self = admins.find((a) => a.id === Number(user.id));
  return self ? isInitialAdminRecord(self) : false;
}
