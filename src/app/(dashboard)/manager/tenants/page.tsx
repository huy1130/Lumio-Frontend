import { Building2, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

const stats = [
  { title: "Total Tenants",  value: "34",      change: 5,   changeLabel: "this month",    icon: <Building2 className="h-4 w-4" />,    iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "Active",         value: "30",      change: 4,   changeLabel: "this month",    icon: <CheckCircle className="h-4 w-4" />,  iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"          },
  { title: "Inactive",       value: "4",       change: 1,   changeLabel: "this month",    icon: <XCircle className="h-4 w-4" />,      iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"                 },
  { title: "MRR",            value: "$6,820",  change: 8.5, changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"              },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Manage Tenants"
      description="View and manage all tenant organizations"
      role="manager"
      breadcrumbs={[{ label: "Manager" }, { label: "Manage Tenants" }]}
      stats={stats}
      tableTitle="Tenant List"
    />
  );
}
