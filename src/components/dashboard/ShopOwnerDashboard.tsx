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
import { orderService, type ApiOrder } from "@/lib/services/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, ChevronLeft, ChevronRight, DollarSign, ShoppingBag, TrendingUp, Calendar } from "lucide-react";

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
  
  const [orders, setOrders] = useState<ApiOrder[]>([]);
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
    orderService.getAll(shopId).then(res => {
      // Only care about completed orders for dashboard stats
      setOrders(res.filter(o => o.order_status === "COMPLETED"));
    }).catch(console.error).finally(() => setLoading(false));
  }, [shopId]);

  // Compute Product Stats
  const productStats = useMemo(() => {
    const map = new Map<number, { name: string; qty: number; revenue: number }>();
    orders.forEach(o => {
      o.order_items?.forEach(item => {
        const id = item.product_id;
        const name = item.product?.product_name || `Món #${id}`;
        const qty = Number(item.quantity) || 0;
        const rev = qty * (Number(item.unit_price) || 0);
        
        if (map.has(id)) {
          const e = map.get(id)!;
          e.qty += qty;
          e.revenue += rev;
        } else {
          map.set(id, { name, qty, revenue: rev });
        }
      });
    });
    
    const arr = Array.from(map.values());
    const sortedDesc = [...arr].sort((a, b) => b.qty - a.qty);
    const sortedAsc = [...arr].sort((a, b) => a.qty - b.qty);
    
    return { top: sortedDesc.slice(0, 5), bottom: sortedAsc.slice(0, 5) };
  }, [orders]);

  // Compute Daily Revenue (custom date range)
  const dateRangedRevenue = useMemo(() => {
    const map = new Map<string, number>();

    orders.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const iso = getLocalISO(d);
      const total = Number(o.grand_total) || 0;
      map.set(iso, (map.get(iso) || 0) + total);
    });

    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.to);
    end.setHours(23, 59, 59, 999);

    // Limit maximum range to 60 days to prevent chart crowding / performance issues
    const diffTime = end.getTime() - start.getTime();
    let totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    if (totalDays > 60) totalDays = 60; 

    const data = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const iso = getLocalISO(d);
      data.push({
        date: d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
        revenue: map.get(iso) || 0
      });
    }

    return data;
  }, [orders, dateRange]);

  // Compute Monthly Revenue (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();

    orders.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      const total = Number(o.grand_total) || 0;
      map.set(key, (map.get(key) || 0) + total);
    });

    const data = [];
    const today = new Date();
    
    // Generate the last 6 months including current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      
      data.push({
        date: `Th ${mm}/${yyyy.toString().slice(2)}`,
        revenue: map.get(key) || 0
      });
    }

    return data;
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0), [orders]);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <span className="font-semibold text-gray-500">Đang tổng hợp dữ liệu báo cáo...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <DollarSign className="w-32 h-32 text-orange-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Tổng Doanh Thu</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(totalRevenue)}
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center">
                    Tất cả thời gian
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <ShoppingBag className="w-32 h-32 text-blue-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Tổng Đơn Hàng</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {totalOrders} <span className="text-base font-medium text-gray-500">đơn</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center">
                    Đã thanh toán thành công
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-gray-900/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <TrendingUp className="w-32 h-32 text-green-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Giá Trị Trung Bình</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(avgOrderValue)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center">
                    / đơn hàng
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

            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <RealProductList
                title="Các món bán chạy nhất"
                description="Top 5 món được khách hàng yêu thích và đặt nhiều nhất"
                data={productStats.top}
                isTop={true}
              />
              <RealProductList
                title="Các món bán chậm"
                description="Top 5 món có lượt mua thấp nhất (cần xem xét lại)"
                data={productStats.bottom}
                isTop={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
