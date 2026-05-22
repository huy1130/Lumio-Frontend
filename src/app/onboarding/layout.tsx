import { RedirectRestrictedRoleFromPublic } from "@/components/guards/RedirectRestrictedRoleFromPublic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RedirectRestrictedRoleFromPublic>{children}</RedirectRestrictedRoleFromPublic>
  );
}
