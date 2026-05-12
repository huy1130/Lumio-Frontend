"use client";

import { FileDown, FileText, Database, Clock, CheckCircle } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/config/roles";

const STATS_BY_ROLE = {
  admin: [
    { title: "Total Exports", value: "203", change: 14, changeLabel: "this month", icon: <FileDown className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"      },
    { title: "CSV Exports",   value: "140", change: 9,  changeLabel: "this month", icon: <FileText className="h-4 w-4" />,     iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"   },
    { title: "DB Dumps",      value: "12",  change: 1,  changeLabel: "this month", icon: <Database className="h-4 w-4" />,     iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"},
    { title: "Pending",       value: "2",   change: 0,  changeLabel: "processing", icon: <Clock className="h-4 w-4" />,        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
  ],
  shop_owner: [
    { title: "Total Exports", value: "87",  change: 8,  changeLabel: "this month", icon: <FileDown className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"      },
    { title: "CSV",           value: "60",  change: 5,  changeLabel: "this month", icon: <FileText className="h-4 w-4" />,     iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"   },
    { title: "DB Snapshots",  value: "6",   change: 0,  changeLabel: "this month", icon: <Database className="h-4 w-4" />,     iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"},
    { title: "Pending",       value: "1",   change: 0,  changeLabel: "processing", icon: <Clock className="h-4 w-4" />,        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
  ],
  staff: [
    { title: "My Exports", value: "14", change: 3,  changeLabel: "this month", icon: <FileDown className="h-4 w-4" />,    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"      },
    { title: "CSV Files",  value: "12", change: 2,  changeLabel: "this month", icon: <FileText className="h-4 w-4" />,    iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"   },
    { title: "Pending",    value: "1",  change: 1,  changeLabel: "processing", icon: <Clock className="h-4 w-4" />,       iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
    { title: "Completed",  value: "13", change: 2,  changeLabel: "this month", icon: <CheckCircle className="h-4 w-4" />, iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  ],
} as const;

export default function ExportPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner", "staff"]}>
      <ExportContent />
    </AccessGuard>
  );
}

function ExportContent() {
  const { role } = useAuth();
  const stats = STATS_BY_ROLE[role as keyof typeof STATS_BY_ROLE] ?? STATS_BY_ROLE.staff;
  const roleLabel = ROLE_LABELS[role] ?? "User";
  const isStaff = role === "staff";

  return (
    <PlaceholderPage
      title="Export Data"
      description={isStaff ? "Export your orders and activity data" : "Export store data to CSV or database snapshots"}
      role={role}
      breadcrumbs={[{ label: roleLabel }, { label: "Export Data" }]}
      stats={stats}
      tableTitle="Export History"
      actions={
        <Button size="sm">
          <FileDown className="h-4 w-4 mr-1.5" />
          {isStaff ? "Export My Orders" : "New Export"}
        </Button>
      }
    />
  );
}
