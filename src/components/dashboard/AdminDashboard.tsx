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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { useAuth } from "@/context/AuthContext";
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
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<SubscriptionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!accessToken) return;
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
  }, [accessToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);


  const sortedPackages = useMemo(() => {
    if (!stats?.packageStats.length) return [];
    return [...stats.packageStats].sort(
      (a, b) => toNumber(b.revenue) - toNumber(a.revenue),
    );
  }, [stats]);

  const totalPurchases = useMemo(
    () => sortedPackages.reduce((sum, p) => sum + p.total_purchased, 0),
    [sortedPackages],
  );

  const revenue = stats ? toNumber(stats.totalRevenue) : 0;
  const totalPayments = stats?.totalPayments ?? 0;
  const totalRenewals = stats?.totalRenewals ?? 0;

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
                Doanh thu PayOS (PAID) · mua mới + gia hạn
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
                title="Tổng lượt thanh toán"
                value={totalPayments}
                changeLabel="mua mới + gia hạn"
                icon={<ShoppingBag className="h-4 w-4" />}
                iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/80 dark:text-blue-300"
              />
              <StatsCard
                title="Mua mới"
                value={totalPurchases}
                icon={<Package className="h-4 w-4" />}
                iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/80 dark:text-orange-300"
              />
              <StatsCard
                title="Gia hạn"
                value={totalRenewals}
                icon={<TrendingUp className="h-4 w-4" />}
                iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-900/80 dark:text-violet-300"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
                <CardHeader className="border-b border-gray-100 bg-white pb-4 dark:border-gray-800 dark:bg-gray-900">
                  <CardTitle className="text-base">Doanh thu theo gói</CardTitle>
                  <CardDescription className="mt-0.5">Biểu đồ cột thể hiện doanh thu (VNĐ)</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedPackages} margin={{ top: 10, right: 10, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                          dataKey="package_code"
                          tickFormatter={(val) => formatPackageCode(val)}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(val) => {
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                            return val;
                          }}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(243, 244, 246, 0.4)" }}
                          formatter={(value: any) => [`${formatCurrency(Number(value))}`, "Doanh thu"]}
                          labelFormatter={(label) => formatPackageCode(label as string)}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        <Bar
                          dataKey="revenue"
                          name="Doanh thu"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
                <CardHeader className="border-b border-gray-100 bg-white pb-4 dark:border-gray-800 dark:bg-gray-900">
                  <CardTitle className="text-base">Lượt mua theo gói</CardTitle>
                  <CardDescription className="mt-0.5">So sánh mua mới và gia hạn</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedPackages} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                          dataKey="package_code"
                          tickFormatter={(val) => formatPackageCode(val)}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(243, 244, 246, 0.4)" }}
                          formatter={(value: any, name: any) => [value, name]}
                          labelFormatter={(label) => formatPackageCode(label as string)}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "15px" }} />
                        <Bar
                          dataKey="total_purchased"
                          name="Mua mới"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          dataKey="total_renewals"
                          name="Gia hạn"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden border-gray-200/80 shadow-sm dark:border-gray-800">
              <CardHeader className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Chi tiết theo gói</CardTitle>
                    <CardDescription className="mt-0.5">
                      Sắp xếp theo doanh thu · cao đến thấp
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {totalPayments > 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {totalPayments} lượt thanh toán
                      </Badge>
                    ) : null}
                    {totalRenewals > 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                      >
                        {totalRenewals} gia hạn
                      </Badge>
                    ) : null}
                  </div>
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
                          Mua mới
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Gia hạn
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Doanh thu
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
                            toNumber(pkg.revenue) > 0 &&
                            "bg-emerald-50/40 dark:bg-emerald-950/20",
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && toNumber(pkg.revenue) > 0 ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">
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
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                                  : "text-muted-foreground",
                              )}
                            >
                              {pkg.total_purchased}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "inline-flex min-w-[2rem] justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                                pkg.total_renewals > 0
                                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300"
                                  : "text-muted-foreground",
                              )}
                            >
                              {pkg.total_renewals}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {toNumber(pkg.revenue) > 0 ? (
                              <span className="text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(toNumber(pkg.revenue))}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0 đ</span>
                            )}
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
