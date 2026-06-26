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
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, ShoppingBag, TrendingUp, Percent, Clock, CheckCircle, ShoppingCart, X } from "lucide-react";
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
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

function HourlyRevenueList({ title, description, data, headerRight, onClickItem, selectedItem }: { title: string; description: string; data: any[]; headerRight?: React.ReactNode; onClickItem?: (item: any) => void; selectedItem?: any; }) {
  return (
    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 flex flex-col h-full rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-start xl:items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            {title}
          </CardTitle>
          <CardDescription className="text-[13px]">{description}</CardDescription>
        </div>
        {headerRight && (
          <div className="flex shrink-0 items-center">
            {headerRight}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col">
          {data.map((item, i) => (
            <div
              key={i}
              onClick={() => onClickItem?.(item)}
              className={`flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors ${onClickItem ? 'cursor-pointer' : ''} ${selectedItem?.name === item.name ? 'bg-orange-50/60 dark:bg-orange-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
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
  const [allOrders, setAllOrders] = useState<any[]>([]);
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

  const [activeFilter, setActiveFilter] = useState<string>('7days');
  const [hourlyDate, setHourlyDate] = useState(getLocalISO(new Date()));
  const [mainTab, setMainTab] = useState<'revenue' | 'details'>('revenue');
  const [selectedPeakHour, setSelectedPeakHour] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const setQuickFilter = (type: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth') => {
    const to = new Date();
    const from = new Date();

    switch (type) {
      case 'today':
        break;
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);
        break;
      case '7days':
        from.setDate(from.getDate() - 6);
        break;
      case '30days':
        from.setDate(from.getDate() - 29);
        break;
      case 'thisMonth':
        from.setDate(1); // 1st day of current month
        break;
    }
    setDateRange({ from: getLocalISO(from), to: getLocalISO(to) });
    setActiveFilter(type);
  };

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
        setAllOrders(ordersRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId, dateRange.from, dateRange.to]);

  useEffect(() => {
    if (!allOrders.length) {
      setHourlyRevenue([]);
      return;
    }

    // Calculate hourly revenue from orders
    const fromDate = new Date(hourlyDate + "T00:00:00");
    const toDate = new Date(hourlyDate + "T23:59:59");

    const filteredOrders = allOrders.filter(o => {
      if (o.order_status !== "COMPLETED") return false;
      const created = new Date(o.created_at);
      return created >= fromDate && created <= toDate;
    });

    const slotMap = new Map<string, { revenue: number; qty: number; dateStr: string; slot: number }>();

    filteredOrders.forEach(o => {
      const d = new Date(o.created_at);
      const dateStr = getLocalISO(d);
      const hour = d.getHours();
      const slot = Math.floor(hour / 2) * 2; // Group by 2 hours
      const key = `${dateStr}|${slot}`;

      const current = slotMap.get(key) || { revenue: 0, qty: 0, dateStr, slot };
      current.revenue += Number(o.grand_total || 0);
      current.qty += 1;
      slotMap.set(key, current);
    });

    const hourlyData = Array.from(slotMap.values()).map(stats => {
      const start = String(stats.slot).padStart(2, '0') + ":00";
      const end = String(stats.slot + 2).padStart(2, '0') + ":00";
      const [, mm, dd] = stats.dateStr.split("-");

      return {
        name: `${dd}/${mm} • ${start}-${end}`,
        qty: stats.qty,
        revenue: stats.revenue,
        dateStr: stats.dateStr,
        slot: stats.slot
      };
    });

    hourlyData.sort((a, b) => b.revenue - a.revenue);
    setHourlyRevenue(hourlyData.slice(0, 5)); // Top 5 time slots
  }, [allOrders, hourlyDate]);

  const summary = report?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    cancelRatio: 0,
    estimatedProfit: 0
  };

  const peakHourOrders = useMemo(() => {
    if (!selectedPeakHour) return [];
    const dStr = selectedPeakHour.dateStr;
    const startHour = selectedPeakHour.slot;
    const endHour = startHour + 1;

    const start = new Date(`${dStr}T${String(startHour).padStart(2, '0')}:00:00`);
    const end = new Date(`${dStr}T${String(endHour).padStart(2, '0')}:59:59`);

    return allOrders.filter(o => {
      if (o.order_status !== "COMPLETED") return false;
      const d = new Date(o.created_at);
      return d >= start && d <= end;
    });
  }, [selectedPeakHour, allOrders]);

  const topProducts = report?.topProducts || [];
  const bottomProducts = report?.bottomProducts || [];
  const dateRangedRevenue = report?.dailyBreakdown || [];
  const monthlyRevenue = report?.monthlyBreakdown || [];

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-px px-2">
          <button
            onClick={() => setMainTab('revenue')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${mainTab === 'revenue' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Doanh thu
          </button>
          <button
            onClick={() => { setMainTab('details'); setSelectedOrder(null); }}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${mainTab === 'details' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Chi tiết
          </button>
        </div>

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
        ) : mainTab === 'revenue' ? (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Global Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-sm backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setQuickFilter('today')} 
                  className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg transition-all shadow-sm ${activeFilter === 'today' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:hover:border-orange-500/30'}`}
                >
                  Hôm nay
                </button>
                <button 
                  onClick={() => setQuickFilter('yesterday')} 
                  className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg transition-all shadow-sm ${activeFilter === 'yesterday' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:hover:border-orange-500/30'}`}
                >
                  Hôm qua
                </button>
                <button 
                  onClick={() => setQuickFilter('7days')} 
                  className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg transition-all shadow-sm ${activeFilter === '7days' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:hover:border-orange-500/30'}`}
                >
                  7 ngày qua
                </button>
                <button 
                  onClick={() => setQuickFilter('thisMonth')} 
                  className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg transition-all shadow-sm ${activeFilter === 'thisMonth' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:hover:border-orange-500/30'}`}
                >
                  Tháng này
                </button>
              </div>
              
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => { setDateRange(prev => ({ ...prev, from: e.target.value })); setActiveFilter(''); }}
                  className="text-sm font-medium border-none px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer" 
                />
                <span className="text-gray-400 font-medium text-xs">→</span>
                <input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => { setDateRange(prev => ({ ...prev, to: e.target.value })); setActiveFilter(''); }}
                  className="text-sm font-medium border-none px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer" 
                />
              </div>
            </div>

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
              />
              <RealColumnChart
                title="Doanh thu theo tháng"
                description="Tổng doanh thu 6 tháng gần nhất"
                data={monthlyRevenue}
                color="#3b82f6"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 items-start">
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
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="lg:col-span-1 h-full max-h-[800px]">
              <HourlyRevenueList
                title="Khung giờ vàng"
                description="Doanh thu theo các khung giờ (mỗi 2 tiếng)"
                data={hourlyRevenue}
                headerRight={
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-100 dark:border-gray-800">
                    <input
                      type="date"
                      value={hourlyDate}
                      onChange={(e) => { setHourlyDate(e.target.value); setSelectedPeakHour(null); setSelectedOrder(null); }}
                      className="text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                }
                onClickItem={(item) => { setSelectedPeakHour(item); setSelectedOrder(null); }}
                selectedItem={selectedPeakHour}
              />
            </div>

            <div className="lg:col-span-1 h-full">
              {!selectedPeakHour ? (
                <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">Chọn một khung giờ để xem chi tiết</p>
                </Card>
              ) : (
                <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden h-full max-h-[800px] flex flex-col">
                  <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 shrink-0">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Hóa đơn ({selectedPeakHour.name})
                    </CardTitle>
                    <CardDescription className="text-[13px]">
                      {peakHourOrders.length} hóa đơn • Tổng: <span className="font-semibold text-orange-500">{formatCurrency(selectedPeakHour.revenue)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
                    {peakHourOrders.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                        Không tìm thấy hóa đơn hợp lệ nào.
                      </div>
                    ) : (
                      peakHourOrders.map((order) => {
                        const d = new Date(order.created_at);
                        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${selectedOrder?.id === order.id
                              ? "bg-white dark:bg-gray-800 border-orange-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-orange-900/20 ring-1 ring-orange-500/50"
                              : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600 dark:bg-green-900/30">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block font-bold text-gray-900 dark:text-gray-100 text-sm">#{order.id}</span>
                                  <span className="block text-[11px] font-medium text-gray-500 mt-0.5">{timeStr} • {order.customer?.full_name || "Khách lẻ"}</span>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {formatCurrency(Number(order.grand_total))}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1 h-full">
              {!selectedOrder ? (
                <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">Chọn hóa đơn để xem chi tiết</p>
                </Card>
              ) : (
                <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden h-full max-h-[800px] flex flex-col">
                  <CardHeader className="border-b border-gray-100/50 pb-5 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 shrink-0 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">Chi tiết #{selectedOrder.id}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                      </CardDescription>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </CardHeader>

                  <CardContent className="p-0 overflow-y-auto flex-1 flex flex-col">
                    <div className="p-5 space-y-5">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Khách hàng</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                          {selectedOrder.customer?.full_name || "Khách lẻ (Walk-in)"}
                          {selectedOrder.customer?.phone && <span className="block text-xs font-normal text-gray-500 mt-1">{selectedOrder.customer.phone}</span>}
                        </p>
                        {selectedOrder.notes && (
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Thanh toán</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedOrder.notes}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold mb-3 text-gray-900 dark:text-gray-100 flex justify-between items-center">
                          Sản phẩm
                          <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 px-2 py-0.5 rounded-full text-xs">{selectedOrder.order_items?.length || 0}</span>
                        </h4>
                        <div className="space-y-3">
                          {selectedOrder.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.product?.product_name || `Món #${item.product_id}`}</p>
                                <p className="text-[11px] font-medium text-gray-500 mt-1">{item.quantity} x {formatCurrency(Number(item.unit_price))}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.quantity * Number(item.unit_price))}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(Number(selectedOrder.subtotal_amount))}</span>
                    </div>
                    <div className="flex justify-between items-center font-black text-lg">
                      <span className="text-gray-900 dark:text-gray-100">Tổng cộng</span>
                      <span className="text-orange-500">{formatCurrency(Number(selectedOrder.grand_total))}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
