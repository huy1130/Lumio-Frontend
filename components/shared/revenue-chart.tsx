"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { month: "Jan", revenue: 18400, orders: 142 },
  { month: "Feb", revenue: 22300, orders: 168 },
  { month: "Mar", revenue: 19800, orders: 155 },
  { month: "Apr", revenue: 27500, orders: 201 },
  { month: "May", revenue: 24100, orders: 184 },
  { month: "Jun", revenue: 31200, orders: 237 },
  { month: "Jul", revenue: 28900, orders: 215 },
  { month: "Aug", revenue: 35600, orders: 264 },
  { month: "Sep", revenue: 33100, orders: 249 },
  { month: "Oct", revenue: 38400, orders: 291 },
  { month: "Nov", revenue: 42100, orders: 318 },
  { month: "Dec", revenue: 47800, orders: 352 },
];

export function RevenueChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue and order volume for 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
