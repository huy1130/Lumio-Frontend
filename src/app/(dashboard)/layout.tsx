import { Sidebar } from "@/components/layout/sidebar";
import { TenantSubscriptionBanner } from "@/components/tenant/TenantSubscriptionBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 pt-4">
            <TenantSubscriptionBanner />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
