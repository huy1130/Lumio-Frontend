import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";

const stats = [
  { title: "Total Users",  value: "186", change: 12, changeLabel: "this month",   icon: <Users className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Active",       value: "172", change: 11, changeLabel: "this month",   icon: <UserCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Inactive",     value: "14",  change: 1,  changeLabel: "this month",   icon: <UserX className="h-4 w-4" />,     iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
  { title: "Roles",        value: "5",   change: 0,  changeLabel: "role types",   icon: <Shield className="h-4 w-4" />,    iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function UsersPage() {
  return (
    <AccessGuard roles={["admin"]}>
      <PlaceholderPage
        title="Users"
        description="Manage all system users and their roles"
        role="admin"
        breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
        stats={stats}
        tableTitle="User List"
      />
    </AccessGuard>
  );
}
