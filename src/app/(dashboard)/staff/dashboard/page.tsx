import { ShoppingCart, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";

const stats = [
  { title: "My Orders Today", value: "8",  change: 2,  changeLabel: "vs yesterday", icon: <ShoppingCart className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Pending",         value: "3",  change: -1, changeLabel: "vs yesterday", icon: <Clock className="h-4 w-4" />,         iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
  { title: "Completed",       value: "5",  change: 3,  changeLabel: "vs yesterday", icon: <CheckCircle className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Total (Month)",   value: "47", change: 12, changeLabel: "this month",   icon: <ClipboardList className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

const activity = [
  { label: "ORD-0001", sub: "John Doe · 09:30",   status: "completed",  value: "$57.75" },
  { label: "ORD-0002", sub: "Jane Smith · 10:15", status: "processing", value: "$17.39" },
  { label: "ORD-0003", sub: "Walk-in · 11:00",    status: "pending",    value: "$12.92" },
  { label: "ORD-0004", sub: "Mark Lee · 11:30",   status: "completed",  value: "$34.50" },
  { label: "ORD-0005", sub: "Sara Kim · 12:00",   status: "pending",    value: "$22.00" },
];

export default function StaffDashboardPage() {
  return (
    <DashboardShell
      title="My Dashboard"
      role="staff"
      stats={stats}
      activity={activity}
      activityTitle="My Recent Orders"
      showCharts={false}
    />
  );
}
