import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RedirectRestrictedRoleFromPublic } from "@/components/guards/RedirectRestrictedRoleFromPublic";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RedirectRestrictedRoleFromPublic>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RedirectRestrictedRoleFromPublic>
  );
}
