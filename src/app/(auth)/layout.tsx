import { ForceLightTheme } from "@/components/layout/ForceLightTheme";
import { RedirectRestrictedRoleFromPublic } from "@/components/guards/RedirectRestrictedRoleFromPublic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ForceLightTheme>
      <RedirectRestrictedRoleFromPublic>{children}</RedirectRestrictedRoleFromPublic>
    </ForceLightTheme>
  );
}
