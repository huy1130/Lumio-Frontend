import { FileText, BarChart3, TrendingUp, Download } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Reports Generated", value: "48",  change: 6,   changeLabel: "this month",   icon: <FileText className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"   },
  { title: "Scheduled",         value: "12",  change: 2,   changeLabel: "active",        icon: <BarChart3 className="h-4 w-4" />,  iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Revenue Report",    value: "↑12%",change: 12,  changeLabel: "vs last month", icon: <TrendingUp className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { title: "Exports",           value: "203", change: 14,  changeLabel: "this month",    icon: <Download className="h-4 w-4" />,   iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Reports"
      description="View, schedule and download business reports"
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Reports" }]}
      stats={stats}
      tableTitle="Report History"
      actions={<Button size="sm"><Download className="h-4 w-4 mr-1.5" />Export</Button>}
    />
  );
}
