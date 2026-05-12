import { Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";

const stats = [
  { title: "Total Admins",  value: "6",  change: 1,  changeLabel: "this month",   icon: <Users className="h-4 w-4" />,       iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "Active",        value: "5",  change: 0,  changeLabel: "no change",    icon: <UserCheck className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Inactive",      value: "1",  change: -1, changeLabel: "vs last month",icon: <UserX className="h-4 w-4" />,       iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
  { title: "Superadmins",   value: "2",  change: 0,  changeLabel: "no change",    icon: <ShieldCheck className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function AdminsPage() {
  return (
    <AccessGuard roles={["manager"]}>
      <PlaceholderPage
        title="Manage Admins"
        description="View and manage admin accounts across all tenants"
        role="manager"
        breadcrumbs={[{ label: "Manager" }, { label: "Admins" }]}
        stats={stats}
        tableTitle="Admin Accounts"
      />
    </AccessGuard>
  );
}
