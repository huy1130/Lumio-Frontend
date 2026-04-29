"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, Search, ArrowUpDown } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { mockInventory } from "@/lib/mock-data";
import { Package, Warehouse } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
};

const statusLabel: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export default function InventoryPage() {
  const [inventory] = useState(mockInventory);
  const [search, setSearch] = useState("");

  const filtered = inventory.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const inStock = inventory.filter((i) => i.status === "in_stock").length;
  const lowStock = inventory.filter((i) => i.status === "low_stock").length;
  const outOfStock = inventory.filter((i) => i.status === "out_of_stock").length;

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="In Stock"
            value={inStock}
            icon={<Package className="h-4 w-4" />}
            iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
          />
          <StatsCard
            title="Low Stock"
            value={lowStock}
            icon={<AlertTriangle className="h-4 w-4" />}
            iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
          />
          <StatsCard
            title="Out of Stock"
            value={outOfStock}
            icon={<Warehouse className="h-4 w-4" />}
            iconClassName="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
          />
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Real-time inventory across all locations</CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Sync
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or SKU..."
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
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-medium">
                      Product <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Max Stock</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === "out_of_stock"
                                ? "bg-red-500"
                                : item.status === "low_stock"
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{item.currentStock} {item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.minStock} {item.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{item.maxStock} {item.unit}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.lastUpdated}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[item.status]}>
                        {statusLabel[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Restock
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
