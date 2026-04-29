import { FileDown, FileText, Database, Clock } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Exports", value: "87",  change: 8,  changeLabel: "this month",   icon: <FileDown className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"   },
  { title: "CSV",           value: "60",  change: 5,  changeLabel: "this month",   icon: <FileText className="h-4 w-4" />,  iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { title: "DB Snapshots",  value: "6",   change: 0,  changeLabel: "this month",   icon: <Database className="h-4 w-4" />,  iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Scheduled",     value: "4",   change: 1,  changeLabel: "auto-exports", icon: <Clock className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Export Data"
      description="Export your store data in various formats"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Export Data" }]}
      stats={stats}
      tableTitle="Export History"
      actions={<Button size="sm"><FileDown className="h-4 w-4 mr-1.5" />New Export</Button>}
    />
  );
}
