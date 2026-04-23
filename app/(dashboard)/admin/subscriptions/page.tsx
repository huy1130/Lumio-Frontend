"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Subscription } from "@/types";

export default function SubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  return (
    <div>
      <Header
        title="Subscriptions"
        breadcrumbs={[{ label: "Admin" }, { label: "Subscriptions" }]}
      />
      <div className="p-6 space-y-6">

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {subscriptions.map((plan, i) => (
            <Card key={plan.id} className={i === 1 ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.planName}</CardTitle>
                  <Badge variant={plan.status === "active" ? "success" : "secondary"}>
                    {plan.status}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground text-sm">/{plan.billingCycle}</span>
                </div>
                <CardDescription>
                  {plan.maxUsers === -1 ? "Unlimited users" : `Up to ${plan.maxUsers} users`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive gap-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table view */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Plans</CardTitle>
              <CardDescription>{subscriptions.length} subscription plans</CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Max Users</TableHead>
                  <TableHead>Max Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.planName}</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                    <TableCell className="capitalize">{plan.billingCycle}</TableCell>
                    <TableCell>{plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}</TableCell>
                    <TableCell>{plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === "active" ? "success" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
