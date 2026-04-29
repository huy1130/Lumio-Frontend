import { CreditCard, ShoppingBag, Users, DollarSign } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";

const stats = [
  { title: "Payments Today",   value: "32",     change: 5,  changeLabel: "vs yesterday", icon: <CreditCard className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Checkouts",        value: "28",     change: 3,  changeLabel: "vs yesterday", icon: <ShoppingBag className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Customers Served", value: "61",     change: 8,  changeLabel: "vs yesterday", icon: <Users className="h-4 w-4" />,       iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Cash Collected",   value: "$3,420", change: 11, changeLabel: "vs yesterday", icon: <DollarSign className="h-4 w-4" />,  iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
];

const activity = [
  { label: "ORD-0001", sub: "card · TXN-ABC123 · 09:32", status: "completed", value: "$57.75" },
  { label: "ORD-0002", sub: "cash · 10:16",              status: "pending",   value: "$17.39" },
  { label: "ORD-0003", sub: "transfer · 11:02",          status: "completed", value: "$12.92" },
  { label: "ORD-0004", sub: "card · TXN-DEF456 · 11:45", status: "completed", value: "$34.50" },
  { label: "ORD-0005", sub: "cash · 12:10",              status: "pending",   value: "$22.00" },
];

export default function CashierDashboardPage() {
  return (
    <DashboardShell
      title="Cashier Dashboard"
      role="cashier"
      stats={stats}
      activity={activity}
      activityTitle="Recent Transactions"
      showCharts={false}
    />
  );
}
