"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CreditCard,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/shared/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { cn, formatCurrency } from "@/lib/utils";
import type { SubscriptionStatsResponse } from "@/types";

function formatPackageCode(code: string): string {
  return code
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function toNumber(value: string | number): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[7.25rem] animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
        />
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<SubscriptionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getStats();
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(
        err instanceof Error ? err.message : "Không tải được thống kê subscription",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const sortedPackages = useMemo(() => {
    if (!stats?.packageStats.length) return [];
    return [...stats.packageStats].sort(
      (a, b) => b.total_purchased - a.total_purchased,
    );
  }, [stats]);

  const totalPurchases = useMemo(
    () => sortedPackages.reduce((sum, p) => sum + p.total_purchased, 0),
    [sortedPackages],
  );

  const topPackage = sortedPackages[0] ?? null;
  const revenue = stats ? toNumber(stats.totalRevenue) : 0;

  return (
    <div className="flex flex-col bg-gray-50/60 dark:bg-gray-950">
      <Header />

      <div className="w-full space-y-6 p-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-white px-5 py-4 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thống kê Subscription
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Doanh thu PayOS (PAID) · lượt mua theo tenant
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              onClick={loadStats}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Làm mới</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
            >
              <Link href="/subscriptions">Quản lý gói</Link>
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
            <CardContent className="flex items-center gap-2 py-4 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </CardContent>
          </Card>
        ) : null}

        {loading && !stats ? (
          <StatsSkeleton />
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Tổng doanh thu"
                value={formatCurrency(revenue)}
                icon={<CreditCard className="h-4 w-4" />}
                iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/80 dark:text-emerald-300"
              />
              <StatsCard
                title="Lượt mua gói"
                value={totalPurchases}
                icon={<ShoppingBag className="h-4 w-4" />}
                iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/80 dark:text-blue-300"
              />
              <StatsCard
                title="Số gói"
                value={stats.packageStats.length}
                icon={<Package className="h-4 w-4" />}
                iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/80 dark:text-orange-300"
              />
              <StatsCard
                title="Bán chạy nhất"
                value={
                  topPackage
                    ? formatPackageCode(topPackage.package_code)
                    : "—"
                }
                icon={<TrendingUp className="h-4 w-4" />}
                iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-900/80 dark:text-violet-300"
              />
            </div>

            <Card className="overflow-hidden border-gray-200/80 shadow-sm dark:border-gray-800">
              <CardHeader className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Chi tiết theo gói</CardTitle>
                    <CardDescription className="mt-0.5">
                      Sắp xếp theo lượt mua · cao đến thấp
                    </CardDescription>
                  </div>
                  {totalPurchases > 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {totalPurchases} lượt mua
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sortedPackages.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chưa có dữ liệu mua gói
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 dark:bg-gray-900/50">
                        <TableHead className="font-semibold">Gói</TableHead>
                        <TableHead className="font-semibold">Mô tả</TableHead>
                        <TableHead className="text-right font-semibold">
                          Giá
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Lượt mua
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPackages.map((pkg, index) => (
                        <TableRow
                          key={pkg.id}
                          className={cn(
                            "transition-colors",
                            index === 0 &&
                              pkg.total_purchased > 0 &&
                              "bg-indigo-50/40 dark:bg-indigo-950/20",
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && pkg.total_purchased > 0 ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">
                                  1
                                </span>
                              ) : null}
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatPackageCode(pkg.package_code)}
                                </span>
                                <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                                  {pkg.package_code}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-muted-foreground">
                            {pkg.description ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(toNumber(pkg.price))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "inline-flex min-w-[2rem] justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                                pkg.total_purchased > 0
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                                  : "text-muted-foreground",
                              )}
                            >
                              {pkg.total_purchased}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
