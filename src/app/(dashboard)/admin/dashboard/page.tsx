import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";

const stats = [
  { title: "Total Revenue",   value: "$47,800", change: 12.5, changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Orders Today",    value: "124",     change: 8.2,  changeLabel: "vs yesterday",  icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"   },
  { title: "Low Stock Items", value: "3",       change: -1,   changeLabel: "vs last week",  icon: <Package className="h-4 w-4" />,      iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"},
  { title: "Active Users",    value: "28",      change: 4,    changeLabel: "this month",    icon: <Users className="h-4 w-4" />,        iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"},
];

const activity = [
  { label: "ORD-0001", sub: "John Doe · Apr 10",     status: "completed",  value: "$57.75" },
  { label: "ORD-0002", sub: "Jane Smith · Apr 10",   status: "processing", value: "$17.39" },
  { label: "ORD-0003", sub: "Walk-in · Apr 10",      status: "pending",    value: "$12.92" },
  { label: "ORD-0004", sub: "Mark Lee · Apr 09",     status: "completed",  value: "$34.50" },
  { label: "ORD-0005", sub: "Sara Kim · Apr 09",     status: "cancelled",  value: "$22.00" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      title="Admin Dashboard"
      role="admin"
      stats={stats}
      activity={activity}
      activityTitle="Recent Orders"
    />
  );
}
