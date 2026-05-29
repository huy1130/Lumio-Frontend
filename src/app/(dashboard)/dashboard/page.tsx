"use client";

import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  ShoppingBag,
  ClipboardList,
  CheckCircle,
  Clock,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ShopOwnerDashboard } from "@/components/dashboard/ShopOwnerDashboard";
import { useAuth } from "@/context/AuthContext";

const SHELL_CONFIGS = {
  inventory_staff: {
    title: "My Dashboard",
    stats: [
      {
        title: "My Orders Today",
        value: "8",
        change: 2,
        changeLabel: "vs yesterday",
        icon: <ShoppingCart className="h-4 w-4" />,
        iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      },
      {
        title: "Pending",
        value: "3",
        change: -1,
        changeLabel: "vs yesterday",
        icon: <Clock className="h-4 w-4" />,
        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
      },
      {
        title: "Completed",
        value: "5",
        change: 3,
        changeLabel: "vs yesterday",
        icon: <CheckCircle className="h-4 w-4" />,
        iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
      },
      {
        title: "Total (Month)",
        value: "47",
        change: 12,
        changeLabel: "this month",
        icon: <ClipboardList className="h-4 w-4" />,
        iconClassName:
          "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      },
    ],
    activity: [
      { label: "ORD-0001", sub: "John Doe · 09:30", status: "completed", value: "$57.75" },
      { label: "ORD-0002", sub: "Jane Smith · 10:15", status: "processing", value: "$17.39" },
      { label: "ORD-0003", sub: "Walk-in · 11:00", status: "pending", value: "$12.92" },
    ],
    activityTitle: "My Recent Orders",
    showCharts: false,
  },
  cashier: {
    title: "Cashier Dashboard",
    stats: [
      {
        title: "Payments Today",
        value: "32",
        change: 5,
        changeLabel: "vs yesterday",
        icon: <CreditCard className="h-4 w-4" />,
        iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      },
      {
        title: "Checkouts",
        value: "28",
        change: 3,
        changeLabel: "vs yesterday",
        icon: <ShoppingBag className="h-4 w-4" />,
        iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
      },
      {
        title: "Customers Served",
        value: "61",
        change: 8,
        changeLabel: "vs yesterday",
        icon: <Users className="h-4 w-4" />,
        iconClassName:
          "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      },
      {
        title: "Cash Collected",
        value: "$3,420",
        change: 11,
        changeLabel: "vs yesterday",
        icon: <DollarSign className="h-4 w-4" />,
        iconClassName:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
      },
    ],
    activity: [
      { label: "ORD-0001", sub: "John Doe · 09:30", status: "completed", value: "$57.75" },
      { label: "ORD-0002", sub: "Jane Smith · 10:15", status: "processing", value: "$17.39" },
    ],
    activityTitle: "Recent Payments",
    showCharts: false,
  },
};

export default function DashboardPage() {
  const { role, isRealAdmin } = useAuth();

  if (isRealAdmin || role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "shop_owner" || role === "cashier") {
    return <ShopOwnerDashboard role={role} />;
  }

  if (role in SHELL_CONFIGS) {
    const cfg = SHELL_CONFIGS[role as keyof typeof SHELL_CONFIGS];
    return (
      <DashboardShell
        title={cfg.title}
        role={role}
        stats={cfg.stats}
        activity={cfg.activity}
        activityTitle={cfg.activityTitle}
        showCharts={cfg.showCharts}
      />
    );
  }

  return <AdminDashboard />;
}
