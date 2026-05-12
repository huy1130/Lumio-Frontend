"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, Search, ArrowUpDown, Warehouse, CheckCircle, TrendingDown } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { mockInventory } from "@/lib/mock-data";
import { Package } from "lucide-react";

export default function InventoryPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <InventoryContent />
    </AccessGuard>
  );
}

function InventoryContent() {
  const { role } = useAuth();

  if (role === "shop_owner") {
    return (
      <PlaceholderPage
        title="Inventory"
        description="Track and manage your store's stock levels"
        role="shop_owner"
        breadcrumbs={[{ label: "Shop Owner" }, { label: "Inventory" }]}
        stats={[
          { title: "Total SKUs",   value: "142", change: 7,  changeLabel: "this month",  icon: <Warehouse className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
          { title: "In Stock",     value: "128", change: 5,  changeLabel: "items",       icon: <CheckCircle className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
          { title: "Low Stock",    value: "10",  change: -2, changeLabel: "alert items", icon: <AlertTriangle className="h-4 w-4" />, iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
          { title: "Out of Stock", value: "4",   change: 1,  changeLabel: "items",       icon: <TrendingDown className="h-4 w-4" />,  iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
        ]}
        tableTitle="Inventory Status"
      />
    );
  }

  return <AdminInventoryView />;
}

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  in_stock: "success", low_stock: "warning", out_of_stock: "destructive",
};
const statusLabel: Record<string, string> = {
  in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock",
};

function AdminInventoryView() {
  const [inventory] = useState(mockInventory);
  const [search, setSearch] = useState("");

  const filtered  = inventory.filter((i) =>
    i.productName.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );
  const inStock   = inventory.filter((i) => i.status === "in_stock").length;
  const lowStock  = inventory.filter((i) => i.status === "low_stock").length;
  const outOfStock= inventory.filter((i) => i.status === "out_of_stock").length;

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="In Stock"      value={inStock}    icon={<Package className="h-4 w-4" />}       iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <StatsCard title="Low Stock"     value={lowStock}   icon={<AlertTriangle className="h-4 w-4" />} iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" />
          <StatsCard title="Out of Stock"  value={outOfStock} icon={<Warehouse className="h-4 w-4" />}     iconClassName="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Real-time inventory across all locations</CardDescription>
              </div>
              <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Sync</Button>
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
                            className={`h-full rounded-full ${item.status === "out_of_stock" ? "bg-red-500" : item.status === "low_stock" ? "bg-orange-500" : "bg-green-500"}`}
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
                      <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Restock</Button>
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
