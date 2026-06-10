"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { tenantService } from "@/lib/services/tenantService";
import type { Tenant } from "@/types";

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function TenantsPage() {
  return (
    <AccessGuard roles={["admin"]}>
      <TenantsContent />
    </AccessGuard>
  );
}

function TenantsContent() {
  const { role } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadTenants = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (err) {
      setTenants([]);
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách tenant",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tenants;

    return tenants.filter((tenant) => {
      return [
        tenant.id,
        tenant.tenant_name,
        tenant.admin_id ?? "",
        tenant.tax_percentage ?? "",
        tenant.loyal_point_per_unit ?? "",
        tenant.is_active ? "active" : "inactive",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [search, tenants]);

  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((tenant) => tenant.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [tenants]);

  const columns = useMemo<Column<Tenant & Record<string, unknown>>[]>(
    () => [
      {
        key: "tenant",
        label: "Hệ thống (Tenant)",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 shadow-sm">
              <span className="font-bold">{row.tenant_name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {row.tenant_name}
              </div>
              <div className="text-[13px] text-muted-foreground mt-0.5">
                Mã ID: {row.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (row) => (
          <span className="text-[13.5px] text-gray-600 dark:text-gray-300">
            {formatDateTime(row.created_at)}
          </span>
        ),
      },
      {
        key: "update_at",
        label: "Ngày cập nhật",
        render: (row) => (
          <span className="text-[13.5px] text-gray-600 dark:text-gray-300">
            {formatDateTime(row.update_at)}
          </span>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        render: (row) => (
          <Badge variant={row.is_active ? "success" : "secondary"}>
            {row.is_active ? "Hoạt động" : "Tạm ngưng"}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <Header />
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <PageHeader
          title="Quản lý Tenants"
          description="Danh sách các hệ thống (Tenant) đang đăng ký dịch vụ."
          role={role}
          breadcrumbs={[{ label: "Admin" }, { label: "Tenants" }]}
          actions={
            <Button
              variant="outline"
              className="gap-2 rounded-xl h-10 px-5 font-semibold bg-white shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800"
              onClick={() => void loadTenants(true)}
              disabled={loading || refreshing}
            >
              {loading || refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Làm mới
            </Button>
          }
        />

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard
              title="Tổng số Tenants"
              value={stats.total}
              icon={<Building2 className="h-5 w-5" />}
              iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
            />
            <StatsCard
              title="Đang hoạt động"
              value={stats.active}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
            />
            <StatsCard
              title="Tạm ngưng"
              value={stats.inactive}
              icon={<XCircle className="h-5 w-5" />}
              iconClassName="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
            />
          </div>
        )}

        <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
          <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5 bg-white/50 dark:bg-gray-900/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Danh sách Hệ thống</CardTitle>
                <CardDescription className="text-[13px] mt-1">
                  {loading
                    ? "Đang tải dữ liệu..."
                    : `Hiển thị ${filteredTenants.length} / ${tenants.length} hệ thống`}
                </CardDescription>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <Input
                  placeholder="Tìm theo tên, ID, trạng thái..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-4 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="text-sm font-medium">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="px-6 py-4 overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={filteredTenants as (Tenant & Record<string, unknown>)[]}
                  emptyMessage={
                    search
                      ? "Không tìm thấy hệ thống nào phù hợp với từ khóa."
                      : "Chưa có hệ thống nào trên nền tảng."
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
