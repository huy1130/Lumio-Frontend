import { DollarSign, ShoppingCart, Package, Users, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/shared/stats-card";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { SalesByCategory } from "@/components/shared/sales-by-category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockOrders, mockInventory } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const stats = [
  { title: "Total Revenue", value: "$47,800", change: 12.5, changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />, iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
  { title: "Orders Today", value: "124", change: 8.2, changeLabel: "vs yesterday", icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { title: "Low Stock Items", value: "3", change: -1, changeLabel: "vs last week", icon: <Package className="h-4 w-4" />, iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" },
  { title: "Active Staff", value: "12", change: 0, changeLabel: "no change", icon: <Users className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  processing: "warning",
  pending: "secondary",
  cancelled: "destructive",
};

export default function DashboardPage() {
  const lowStockItems = mockInventory.filter((i) => i.status !== "in_stock");

  return (
    <div>
      <Header title="Dashboard" breadcrumbs={[{ label: "Home" }, { label: "Dashboard" }]} />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
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
