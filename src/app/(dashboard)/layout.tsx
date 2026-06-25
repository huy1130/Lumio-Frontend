import { Sidebar } from "@/components/layout/sidebar";
import { TenantSubscriptionBanner } from "@/components/tenant/TenantSubscriptionBanner";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireSubscription } from "@/components/guards/RequireSubscription";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <RequireSubscription>
              <TenantSubscriptionBanner className="mx-6 mt-4 mb-4" />
              {children}
            </RequireSubscription>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
