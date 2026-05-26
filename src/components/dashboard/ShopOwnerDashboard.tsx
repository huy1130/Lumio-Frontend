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

export function ShopOwnerDashboard() {
  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Bảng điều khiển"
          description="Tổng quan doanh thu và hiệu suất bán hàng của cửa hàng."
          role="shop_owner"
          breadcrumbs={[{ label: "Shop Owner" }, { label: "Dashboard" }]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <ProductListPlaceholder
            title="Các món bán chạy"
            description="Top món được đặt nhiều nhất"
          />
          <ProductListPlaceholder
            title="Các món ít được bán"
            description="Món có lượt bán thấp nhất"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ColumnChartPlaceholder
            title="Doanh thu theo ngày"
            description="Biểu đồ cột — doanh thu từng ngày"
          />
          <ColumnChartPlaceholder
            title="Doanh thu theo tháng"
            description="Biểu đồ cột — doanh thu từng tháng"
          />
        </div>
      </div>
    </div>
  );
}
