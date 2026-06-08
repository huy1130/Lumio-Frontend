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
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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

function RealProductList({ title, description, data }: { title: string; description: string; data: any[] }) {
  return (
    <Card className="border-gray-200/80 shadow-sm dark:border-gray-800 flex flex-col h-full">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="mt-0.5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
              <TableHead className="text-xs uppercase tracking-wider">Món</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-center">Số lượng</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                Doanh thu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-sm">{item.name}</TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-right text-orange-500 font-semibold">
                  {formatCurrency(item.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <p className="border-t border-gray-100 px-4 py-6 text-center text-sm text-muted-foreground dark:border-gray-800">
            Chưa có dữ liệu
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RealColumnChart({ title, description, data, headerRight }: { 
  title: string; description: string; data: any[];
  headerRight?: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-0.5">{description}</CardDescription>
        </div>
        {headerRight && (
          <div className="flex shrink-0 items-center">
            {headerRight}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(val) => `₫${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#f97316" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
               Chưa có dữ liệu
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

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Bảng điều khiển"
          description="Tổng quan doanh thu và hiệu suất bán hàng dựa trên các đơn hàng đã thanh toán."
          role={role as any}
          breadcrumbs={[{ label: role === "cashier" ? "Thu ngân" : "Quản lý Cửa hàng" }, { label: "Dashboard" }]}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 font-medium text-gray-500">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <RealProductList
                title="Các món bán chạy nhất"
                description="Top 5 món được khách hàng yêu thích và đặt nhiều nhất"
                data={productStats.top}
              />
              <RealProductList
                title="Các món bán chậm"
                description="Top 5 món có lượt mua thấp nhất (cần xem xét lại)"
                data={productStats.bottom}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <RealColumnChart
                title="Doanh thu theo ngày"
                description="Tổng doanh thu từng ngày trong khoảng thời gian chọn"
                data={dateRangedRevenue}
                headerRight={
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Từ ngày</label>
                      <input 
                        type="date" 
                        value={dateRange.from} 
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Đến ngày</label>
                      <input 
                        type="date" 
                        value={dateRange.to} 
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                  </div>
                }
              />
              <RealColumnChart
                title="Doanh thu theo tháng"
                description="Tổng doanh thu 6 tháng gần nhất"
                data={monthlyRevenue}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
