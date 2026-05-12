"use client";

import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Building2, BrainCircuit, ShieldCheck, CreditCard, ShoppingBag, ClipboardList, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/shared/stats-card";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { SalesByCategory } from "@/components/shared/sales-by-category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { mockOrders, mockInventory } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  processing: "warning",
  pending: "secondary",
  cancelled: "destructive",
};

// Per-role DashboardShell configs (manager / shop_owner / staff / cashier)
const SHELL_CONFIGS = {
  manager: {
    title: "Manager Dashboard",
    stats: [
      { title: "Total Admins",  value: "6",   change: 1,    changeLabel: "this month",    icon: <Users className="h-4 w-4" />,       iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
      { title: "Total Tenants", value: "34",  change: 5,    changeLabel: "this month",    icon: <Building2 className="h-4 w-4" />,   iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { title: "AI Requests",   value: "12k", change: 18.3, changeLabel: "vs last month", icon: <BrainCircuit className="h-4 w-4" />,iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
      { title: "System Health", value: "99%", change: 0.1,  changeLabel: "uptime",        icon: <ShieldCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
    ],
    activity: [
      { label: "Bob Admin",   sub: "admin@pos.com · Store A", status: "active",   value: "Admin" },
      { label: "Carol Admin", sub: "carol@pos.com · Store B", status: "active",   value: "Admin" },
      { label: "Dan Admin",   sub: "dan@pos.com · Store C",   status: "inactive", value: "Admin" },
    ],
    activityTitle: "Admin Accounts",
    showCharts: false,
  },
  shop_owner: {
    title: "Shop Owner Dashboard",
    stats: [
      { title: "Monthly Revenue", value: "$24,300", change: 9.8,  changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />,   iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { title: "Orders Today",    value: "56",      change: 3.1,  changeLabel: "vs yesterday",  icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"           },
      { title: "Active Products", value: "142",     change: 7,    changeLabel: "total active",  icon: <Package className="h-4 w-4" />,      iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"   },
      { title: "Growth",          value: "+14%",    change: 14,   changeLabel: "this quarter",  icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"   },
    ],
    activity: [
      { label: "ORD-0001", sub: "John Doe · Apr 10",   status: "completed",  value: "$57.75" },
      { label: "ORD-0002", sub: "Jane Smith · Apr 10", status: "processing", value: "$17.39" },
      { label: "ORD-0003", sub: "Walk-in · Apr 10",    status: "pending",    value: "$12.92" },
    ],
    activityTitle: "Recent Orders",
    showCharts: true,
  },
  staff: {
    title: "My Dashboard",
    stats: [
      { title: "My Orders Today", value: "8",  change: 2,  changeLabel: "vs yesterday", icon: <ShoppingCart className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
      { title: "Pending",         value: "3",  change: -1, changeLabel: "vs yesterday", icon: <Clock className="h-4 w-4" />,         iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
      { title: "Completed",       value: "5",  change: 3,  changeLabel: "vs yesterday", icon: <CheckCircle className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
      { title: "Total (Month)",   value: "47", change: 12, changeLabel: "this month",   icon: <ClipboardList className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
    ],
    activity: [
      { label: "ORD-0001", sub: "John Doe · 09:30",   status: "completed",  value: "$57.75" },
      { label: "ORD-0002", sub: "Jane Smith · 10:15", status: "processing", value: "$17.39" },
      { label: "ORD-0003", sub: "Walk-in · 11:00",    status: "pending",    value: "$12.92" },
    ],
    activityTitle: "My Recent Orders",
    showCharts: false,
  },
  cashier: {
    title: "Cashier Dashboard",
    stats: [
      { title: "Payments Today",   value: "32",     change: 5,  changeLabel: "vs yesterday", icon: <CreditCard className="h-4 w-4" />,  iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
      { title: "Checkouts",        value: "28",     change: 3,  changeLabel: "vs yesterday", icon: <ShoppingBag className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
      { title: "Customers Served", value: "61",     change: 8,  changeLabel: "vs yesterday", icon: <Users className="h-4 w-4" />,       iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Cash Collected",   value: "$3,420", change: 11, changeLabel: "vs yesterday", icon: <DollarSign className="h-4 w-4" />,  iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
    ],
    activity: [
      { label: "ORD-0001", sub: "John Doe · 09:30",   status: "completed",  value: "$57.75" },
      { label: "ORD-0002", sub: "Jane Smith · 10:15", status: "processing", value: "$17.39" },
    ],
    activityTitle: "Recent Payments",
    showCharts: false,
  },
};

export default function DashboardPage() {
  const { role } = useAuth();

  // manager / staff / cashier / shop_owner → DashboardShell
  if (role in SHELL_CONFIGS) {
    const cfg = SHELL_CONFIGS[role as keyof typeof SHELL_CONFIGS];
    return <DashboardShell title={cfg.title} role={role} stats={cfg.stats} activity={cfg.activity} activityTitle={cfg.activityTitle} showCharts={cfg.showCharts} />;
  }

  // admin → full featured dashboard with charts
  const lowStockItems = mockInventory.filter((i) => i.status !== "in_stock");
  const adminStats = [
    { title: "Total Revenue", value: "$47,800", change: 12.5, changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
    { title: "Orders Today",  value: "124",     change: 8.2,  changeLabel: "vs yesterday",  icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
    { title: "Low Stock",     value: "3",       change: -1,   changeLabel: "vs last week",  icon: <Package className="h-4 w-4" />,      iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" },
    { title: "Active Staff",  value: "12",      change: 0,    changeLabel: "no change",     icon: <Users className="h-4 w-4" />,        iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  ];

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart />
          <SalesByCategory />
        </div>

        {/* Bottom row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[order.status] ?? "secondary"} className="capitalize">
                        {order.status}
                      </Badge>
                      <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All items are well stocked ✓</p>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku} · Min: {item.minStock} {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={item.status === "out_of_stock" ? "destructive" : "warning"}>
                          {item.status === "out_of_stock" ? "Out of stock" : "Low stock"}
                        </Badge>
                        <span className="text-sm font-semibold">{item.currentStock} {item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
