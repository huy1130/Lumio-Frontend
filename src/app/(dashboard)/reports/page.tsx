"use client";

import type { ReactNode } from "react";
import { FileText, BarChart3, TrendingUp, Download } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/roles";

interface StatItem {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  iconClassName: string;
}

const STATS_BY_ROLE: Record<string, StatItem[]> = {
  admin: [
    { title: "Reports Generated", value: "48",  change: 6,  changeLabel: "this month",   icon: <FileText className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"       },
    { title: "Scheduled",         value: "12",  change: 2,  changeLabel: "active",        icon: <BarChart3 className="h-4 w-4" />,  iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"},
    { title: "Revenue Report",    value: "+12%",change: 12, changeLabel: "vs last month", icon: <TrendingUp className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
    { title: "Downloads",         value: "36",  change: 4,  changeLabel: "this month",    icon: <Download className="h-4 w-4" />,   iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
  ],
  shop_owner: [
    { title: "Reports",   value: "22",  change: 4,  changeLabel: "this month",   icon: <FileText className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"       },
    { title: "Scheduled", value: "5",   change: 1,  changeLabel: "active",        icon: <BarChart3 className="h-4 w-4" />,  iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"},
    { title: "Revenue +", value: "+10%",change: 10, changeLabel: "vs last month", icon: <TrendingUp className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
    { title: "Downloads", value: "18",  change: 3,  changeLabel: "this month",    icon: <Download className="h-4 w-4" />,   iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
  ],
};

export default function ReportsPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <ReportsContent />
    </AccessGuard>
  );
}

function ReportsContent() {
  const { role } = useAuth();
  const stats = STATS_BY_ROLE[role] ?? STATS_BY_ROLE.shop_owner;
  const roleLabel = ROLE_LABELS[role] ?? "User";

  return (
    <PlaceholderPage
      title="Reports"
      description="Generate and schedule analytics reports"
      role={role}
      breadcrumbs={[{ label: roleLabel }, { label: "Reports" }]}
      stats={stats}
      tableTitle="Report History"
      actions={<Button size="sm"><FileText className="h-4 w-4 mr-1.5" />Generate Report</Button>}
    />
  );
}
