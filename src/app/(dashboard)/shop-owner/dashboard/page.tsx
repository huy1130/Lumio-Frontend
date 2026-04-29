import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";

const stats = [
  { title: "Monthly Revenue", value: "$24,300", change: 9.8,  changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />,   iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "Orders Today",    value: "56",      change: 3.1,  changeLabel: "vs yesterday",  icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"           },
  { title: "Active Products", value: "142",     change: 7,    changeLabel: "total active",  icon: <Package className="h-4 w-4" />,      iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"   },
  { title: "Growth",          value: "+14%",    change: 14,   changeLabel: "this quarter",  icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"   },
];

const activity = [
  { label: "ORD-0001", sub: "John Doe · Apr 10",   status: "completed",  value: "$57.75" },
  { label: "ORD-0002", sub: "Jane Smith · Apr 10", status: "processing", value: "$17.39" },
  { label: "ORD-0003", sub: "Walk-in · Apr 10",    status: "pending",    value: "$12.92" },
  { label: "ORD-0004", sub: "Mark Lee · Apr 09",   status: "completed",  value: "$34.50" },
  { label: "ORD-0005", sub: "Sara Kim · Apr 09",   status: "completed",  value: "$22.00" },
];

export default function ShopOwnerDashboardPage() {
  return (
    <DashboardShell
      title="Shop Dashboard"
      role="shop_owner"
      stats={stats}
      activity={activity}
      activityTitle="Recent Orders"
    />
  );
}
