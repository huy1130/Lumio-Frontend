"use client";

import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, ShoppingBag, TrendingUp, Percent, Clock } from "lucide-react";
import { reportService, type SalesReportResponse } from "@/lib/services/reportService";
import { orderService } from "@/lib/services/orderService";

const SKELETON_ROWS = 5;
const SKELETON_BARS = [40, 65, 50, 80, 55, 70, 45];

function SkeletonBar({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className ?? ""}`}
    />
  );
}

function ProductListPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="mt-0.5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
              <TableHead className="text-xs uppercase tracking-wider">Món</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Số lượng</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                Doanh thu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <SkeletonBar className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <SkeletonBar className="h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <SkeletonBar className="ml-auto h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="border-t border-gray-100 px-4 py-3 text-center text-xs text-muted-foreground dark:border-gray-800">
          Chưa có dữ liệu
        </p>
      </CardContent>
    </Card>
  );
}

function ColumnChartPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="mt-0.5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex h-[280px] flex-col">
          <div className="flex flex-1 items-end justify-between gap-2 border-b border-l border-gray-200 pb-2 pl-2 dark:border-gray-700">
            {SKELETON_BARS.map((h, i) => (
              <SkeletonBar
                key={i}
                className="w-full max-w-[2.5rem] rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between gap-2">
            {SKELETON_BARS.map((_, i) => (
              <SkeletonBar key={i} className="h-3 w-full max-w-[2.5rem]" />
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Chưa có dữ liệu</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RealProductList({ title, description, data, isTop }: { title: string; description: string; data: any[]; isTop?: boolean }) {
  return (
    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 flex flex-col h-full rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {isTop ? <span className="text-orange-500">🔥</span> : <span className="text-blue-500">❄️</span>}
          {title}
        </CardTitle>
        <CardDescription className="text-[13px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                  i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                  i === 2 ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-500" :
                  "bg-gray-50 text-gray-400 dark:bg-gray-800"
                }`}>
                  {i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.qty} đã bán</span>
                </div>
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.revenue)}
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">Chưa có dữ liệu thống kê</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HourlyRevenueList({ title, description, data }: { title: string; description: string; data: any[] }) {
  return (
    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 flex flex-col h-full rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          {title}
        </CardTitle>
        <CardDescription className="text-[13px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
                  i === 1 ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" :
                  i === 2 ? "bg-indigo-50/50 text-indigo-600/80 dark:bg-indigo-900/10 dark:text-indigo-400/80" :
                  "bg-gray-50 text-gray-400 dark:bg-gray-800"
                }`}>
                  {i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.qty} đơn</span>
                </div>
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.revenue)}
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">Chưa có dữ liệu thống kê</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RealColumnChart({ title, description, data, headerRight, color = "#f97316" }: { 
  title: string; description: string; data: any[];
  headerRight?: React.ReactNode;
  color?: string;
}) {
  return (
    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
          <CardDescription className="text-[13px]">{description}</CardDescription>
        </div>
        {headerRight && (
          <div className="flex shrink-0 items-center">
            {headerRight}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(val) => val === 0 ? "0" : `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]}
                  labelStyle={{ fontWeight: '700', color: '#111827', marginBottom: '8px' }}
                  itemStyle={{ fontWeight: '600', color: color }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill={color}
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col h-full items-center justify-center text-gray-400 dark:text-gray-500">
               <div className="text-4xl mb-3">📊</div>
               <p className="text-sm">Chưa có dữ liệu biểu đồ</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ShopOwnerDashboard({ role = "shop_owner" }: { role?: string }) {
  const { user } = useAuth();
  const shopId = user?.shop_id;
  
  const [report, setReport] = useState<SalesReportResponse | null>(null);
  const [hourlyRevenue, setHourlyRevenue] = useState<Array<{ name: string; revenue: number; qty: number }>>([]);
  const [loading, setLoading] = useState(true);
  
  const getLocalISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 6);
  
  const [dateRange, setDateRange] = useState({
    from: getLocalISO(defaultFrom),
    to: getLocalISO(new Date())
  });

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);

    Promise.all([
      reportService.getSalesReport({
        startDate: dateRange.from,
        endDate: dateRange.to,
        shopId: shopId || undefined
      }),
      orderService.getAll(shopId).catch(() => []) // Fallback in case of error
    ])
    .then(([reportRes, ordersRes]) => {
      setReport(reportRes);
      
      // Calculate hourly revenue from orders
      const fromDate = new Date(dateRange.from + "T00:00:00");
      const toDate = new Date(dateRange.to + "T23:59:59");
      
      const filteredOrders = ordersRes.filter(o => {
        if (o.order_status !== "COMPLETED") return false;
        const created = new Date(o.created_at);
        return created >= fromDate && created <= toDate;
      });

      const slotMap = new Map<number, { revenue: number; qty: number }>();
      
      filteredOrders.forEach(o => {
        const d = new Date(o.created_at);
        const hour = d.getHours();
        const slot = Math.floor(hour / 2) * 2; // Group by 2 hours
        
        const current = slotMap.get(slot) || { revenue: 0, qty: 0 };
        current.revenue += Number(o.grand_total || 0);
        current.qty += 1;
        slotMap.set(slot, current);
      });
      
      const hourlyData = Array.from(slotMap.entries()).map(([slot, stats]) => {
        const start = String(slot).padStart(2, '0') + ":00";
        const end = String(slot + 2).padStart(2, '0') + ":00";
        return {
          name: `${start} - ${end}`,
          qty: stats.qty,
          revenue: stats.revenue
        };
      });
      
      hourlyData.sort((a, b) => b.revenue - a.revenue);
      setHourlyRevenue(hourlyData.slice(0, 5)); // Top 5 time slots
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [shopId, dateRange.from, dateRange.to]);

  const summary = report?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    cancelRatio: 0,
    estimatedProfit: 0
  };

  const topProducts = report?.topProducts || [];
  const bottomProducts = report?.bottomProducts || [];
  const dateRangedRevenue = report?.dailyBreakdown || [];
  const monthlyRevenue = report?.monthlyBreakdown || [];

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Bảng điều khiển"
          description="Tổng quan doanh thu và hiệu suất bán hàng dựa trên các đơn hàng đã thanh toán."
          role={role as any}
          breadcrumbs={[{ label: role === "cashier" ? "Thu ngân" : "Quản lý Cửa hàng" }, { label: "Dashboard" }]}
        />

        {loading && !report ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <span className="font-semibold text-gray-500">Đang tổng hợp dữ liệu báo cáo...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <DollarSign className="w-24 h-24 text-orange-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng Doanh Thu</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(summary.totalRevenue)}
                  </h3>
                  <p className="text-[11px] text-green-600 dark:text-green-400 mt-2 font-medium">
                    Trong khoảng lọc
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <ShoppingBag className="w-24 h-24 text-blue-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng Đơn Hàng</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {summary.totalOrders} <span className="text-sm font-medium text-gray-500">đơn</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Đã hoàn thành
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <TrendingUp className="w-24 h-24 text-green-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Giá Trị Trung Bình</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(summary.averageOrderValue)}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    / đơn hàng
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <DollarSign className="w-24 h-24 text-emerald-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Lợi Nhuận Ước Tính</p>
                  <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatCurrency(summary.estimatedProfit)}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    (Doanh thu - Giá vốn)
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <Percent className="w-24 h-24 text-red-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tỉ Lệ Hủy Đơn</p>
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400 tracking-tight">
                    {(summary.cancelRatio * 100).toFixed(1)}%
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Số đơn hủy / Tổng đơn
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <RealColumnChart
                title="Doanh thu theo ngày"
                description="Tổng doanh thu từng ngày trong khoảng thời gian chọn"
                data={dateRangedRevenue}
                headerRight={
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={dateRange.from} 
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer" 
                      />
                    </div>
                    <span className="text-gray-400 font-medium text-xs">→</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={dateRange.to} 
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer" 
                      />
                    </div>
                  </div>
                }
              />
              <RealColumnChart
                title="Doanh thu theo tháng"
                description="Tổng doanh thu 6 tháng gần nhất"
                data={monthlyRevenue}
                color="#3b82f6"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <HourlyRevenueList
                title="Khung giờ vàng"
                description="Doanh thu theo các khung giờ (mỗi 2 tiếng)"
                data={hourlyRevenue}
              />
              <RealProductList
                title="Các món bán chạy nhất"
                description="Top 5 món được khách hàng yêu thích và đặt nhiều nhất"
                data={topProducts.map((p: any) => ({ name: p.name, qty: p.quantity, revenue: p.revenue }))}
                isTop={true}
              />
              <RealProductList
                title="Các món bán chậm"
                description="Top 5 món có lượt mua thấp nhất (cần xem xét lại)"
                data={bottomProducts.map((p: any) => ({ name: p.name, qty: p.quantity, revenue: p.revenue }))}
                isTop={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
