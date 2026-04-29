import { FileDown, FileText, Clock, CheckCircle } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "My Exports",   value: "14",  change: 3,  changeLabel: "this month",  icon: <FileDown className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"   },
  { title: "CSV Files",    value: "12",  change: 2,  changeLabel: "this month",  icon: <FileText className="h-4 w-4" />,     iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { title: "Pending",      value: "1",   change: 1,  changeLabel: "processing",  icon: <Clock className="h-4 w-4" />,        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
  { title: "Completed",    value: "13",  change: 2,  changeLabel: "this month",  icon: <CheckCircle className="h-4 w-4" />,  iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Export Data"
      description="Export your orders and activity data"
      role="staff"
      breadcrumbs={[{ label: "Staff" }, { label: "Export Data" }]}
      stats={stats}
      tableTitle="Export History"
      actions={<Button size="sm"><FileDown className="h-4 w-4 mr-1.5" />Export My Orders</Button>}
    />
  );
}
