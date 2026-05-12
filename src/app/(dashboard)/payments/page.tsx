"use client";

import { useState } from "react";
import { CreditCard, Banknote, ArrowLeftRight, CheckCircle, Clock, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { mockPayments, mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  return (
    <AccessGuard roles={["cashier"]}>
      <PaymentsContent />
    </AccessGuard>
  );
}

const methodIcon: Record<string, React.ReactNode> = {
  cash:     <Banknote className="h-4 w-4" />,
  card:     <CreditCard className="h-4 w-4" />,
  transfer: <ArrowLeftRight className="h-4 w-4" />,
};

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  pending:   "warning",
  failed:    "destructive",
  refunded:  "secondary",
};

function PaymentsContent() {
  const [search, setSearch] = useState("");

  const filtered = mockPayments.filter(
    (p) =>
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.processedBy.toLowerCase().includes(search.toLowerCase())
  );

  const completed        = mockPayments.filter((p) => p.status === "completed");
  const pending          = mockPayments.filter((p) => p.status === "pending");
  const totalProcessed   = completed.reduce((s, p) => s + p.amount, 0);
  const unpaidOrders     = mockOrders.filter((o) => o.paymentStatus === "unpaid");

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Processed Today"    value={formatCurrency(totalProcessed)} icon={<CheckCircle className="h-4 w-4" />} iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <StatsCard title="Pending"            value={pending.length}                 icon={<Clock className="h-4 w-4" />}       iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" />
          <StatsCard title="Total Transactions" value={mockPayments.length}            icon={<CreditCard className="h-4 w-4" />}  iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unpaid Orders</CardTitle>
              <CardDescription>Awaiting payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {unpaidOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All orders are paid ✓</p>
              ) : (
                unpaidOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
                      <span className="font-bold">{formatCurrency(order.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.customerName} · {order.items.length} item(s)</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1 h-7 text-xs"><Banknote className="h-3 w-3" /> Cash</Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1 h-7 text-xs"><CreditCard className="h-3 w-3" /> Card</Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1 h-7 text-xs"><ArrowLeftRight className="h-3 w-3" /> Transfer</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>{filtered.length} transactions</CardDescription>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order or cashier..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono font-semibold">{payment.orderNumber}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 capitalize">
                            {methodIcon[payment.method]}
                            {payment.method}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[payment.status]} className="capitalize">{payment.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{payment.transactionRef ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.processedBy}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(payment.processedAt)}</TableCell>
                        <TableCell className="text-right">
                          {payment.status === "completed" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive">Refund</Button>
                          )}
                          {payment.status === "pending" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600">Confirm</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
