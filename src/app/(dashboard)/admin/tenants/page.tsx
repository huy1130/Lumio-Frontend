import { Building2, CheckCircle, Users, CreditCard } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

const stats = [
  { title: "Total Tenants", value: "34",     change: 5,   changeLabel: "this month",    icon: <Building2 className="h-4 w-4" />,   iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "Active",        value: "30",     change: 4,   changeLabel: "this month",    icon: <CheckCircle className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"          },
  { title: "Total Users",   value: "186",    change: 12,  changeLabel: "this month",    icon: <Users className="h-4 w-4" />,       iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"              },
  { title: "Subscriptions", value: "30",     change: 4,   changeLabel: "active plans",  icon: <CreditCard className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"       },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Tenants"
      description="Manage all tenant organizations in your instance"
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Tenants" }]}
      stats={stats}
      tableTitle="Tenant Directory"
    />
  );
}
