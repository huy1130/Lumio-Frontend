import { FileDown, FileText, Database, Clock } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Exports",  value: "203",  change: 14, changeLabel: "this month",    icon: <FileDown className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"   },
  { title: "CSV Exports",    value: "140",  change: 9,  changeLabel: "this month",    icon: <FileText className="h-4 w-4" />,  iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { title: "DB Dumps",       value: "12",   change: 1,  changeLabel: "this month",    icon: <Database className="h-4 w-4" />,  iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Scheduled",      value: "8",    change: 2,  changeLabel: "auto-exports",  icon: <Clock className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Export Data"
      description="Export business data in various formats"
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Export Data" }]}
      stats={stats}
      tableTitle="Export History"
      actions={<Button size="sm"><FileDown className="h-4 w-4 mr-1.5" />New Export</Button>}
    />
  );
}
