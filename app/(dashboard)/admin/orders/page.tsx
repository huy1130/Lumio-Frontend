import { Eye, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";

const orderStatusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  processing: "warning",
  pending: "secondary",
  cancelled: "destructive",
};

const paymentVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  refunded: "secondary",
};

export default function AdminOrdersPage() {
  const total = mockOrders.reduce((s, o) => s + o.total, 0);
  const completed = mockOrders.filter((o) => o.status === "completed").length;
  const pending = mockOrders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <Header title="Orders" breadcrumbs={[{ label: "Admin" }, { label: "Orders" }]} />
      <div className="p-6 space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Orders" value={mockOrders.length} icon={<ShoppingCart className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
          <StatsCard title="Total Revenue" value={formatCurrency(total)} icon={<DollarSign className="h-4 w-4" />} iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" />
          <StatsCard title="Pending" value={pending} icon={<Clock className="h-4 w-4" />} iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Read-only view of all system orders</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{order.items.length} item(s)</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={orderStatusVariant[order.status]} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentVariant[order.paymentStatus]} className="capitalize">
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {order.paymentMethod ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.createdBy}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
