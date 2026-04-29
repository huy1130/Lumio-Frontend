import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/shared/stats-card";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { SalesByCategory } from "@/components/shared/sales-by-category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import type { Role } from "@/config/roles";

interface StatItem {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  iconClassName: string;
}

interface ActivityItem {
  label: string;
  sub: string;
  status: string;
  value: string;
}

interface DashboardShellProps {
  title: string;
  role: Role;
  stats: StatItem[];
  activity: ActivityItem[];
  activityTitle?: string;
  showCharts?: boolean;
}

export function DashboardShell({
  title,
  role,
  stats,
  activity,
  activityTitle = "Recent Activity",
  showCharts = true,
}: DashboardShellProps) {
  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        {/* Role badge */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <RoleBadge role={role} />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Charts */}
        {showCharts && (
          <div className="grid gap-6 lg:grid-cols-3">
            <RevenueChart />
            <SalesByCategory />
          </div>
        )}

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{activityTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
