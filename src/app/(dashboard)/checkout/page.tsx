"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { ShoppingBag, CreditCard, Banknote, ArrowRightLeft, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <AccessGuard roles={["cashier"]}>
      <CheckoutContent />
    </AccessGuard>
  );
}

const PENDING_ORDERS = [
  { id: "ORD-0002", customer: "Jane Smith",       total: 17.39, items: 2 },
  { id: "ORD-0003", customer: "Walk-in Customer", total: 12.92, items: 1 },
  { id: "ORD-0006", customer: "Mark Lee",         total: 34.50, items: 3 },
];

type PayMethod = "cash" | "card" | "transfer";

function CheckoutContent() {
  const [selectedOrder, setSelectedOrder] = useState<typeof PENDING_ORDERS[0] | null>(null);
  const [method, setMethod]               = useState<PayMethod>("card");
  const [done, setDone]                   = useState(false);

  function handleProcess() {
    setDone(true);
    setTimeout(() => { setDone(false); setSelectedOrder(null); }, 2000);
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Checkout"
          description="Process customer payments at the counter"
          role="cashier"
          breadcrumbs={[{ label: "Cashier" }, { label: "Checkout" }]}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Awaiting Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {PENDING_ORDERS.map((order) => (
                <button
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setDone(false); }}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedOrder?.id === order.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer} · {order.items} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="pending" />
                    <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!selectedOrder ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select an order to process</p>
              ) : done ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="font-semibold text-green-600">Payment Processed!</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.id}</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Order</p>
                    <p className="text-sm font-semibold">{selectedOrder.id} — {selectedOrder.customer}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["card", "cash", "transfer"] as PayMethod[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMethod(m)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                            method === m
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {m === "card"     && <CreditCard className="h-4 w-4" />}
                          {m === "cash"     && <Banknote className="h-4 w-4" />}
                          {m === "transfer" && <ArrowRightLeft className="h-4 w-4" />}
                          <span className="capitalize">{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {method === "cash" && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Cash Received</p>
                      <Input placeholder="0.00" type="number" defaultValue={selectedOrder.total.toFixed(2)} />
                    </div>
                  )}
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleProcess}>
                    <CheckCircle className="h-4 w-4 mr-2" />Process Payment
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
