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
  return date.toLocaleString("vi-VN");
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

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tenants"
          description="Xem danh sách tenant và trạng thái hoạt động."
          role={role}
          breadcrumbs={[{ label: "Admin" }, { label: "Tenants" }]}
          actions={
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => void loadTenants(true)}
              disabled={loading || refreshing}
            >
              {loading || refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Tenants</CardDescription>
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Active</CardDescription>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <CardTitle className="text-3xl text-green-600">
                  {stats.active}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Inactive</CardDescription>
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
                <CardTitle className="text-3xl text-muted-foreground">
                  {stats.inactive}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Tenant Overview</CardTitle>
                <CardDescription>
                  {loading
                    ? "Loading…"
                    : `${filteredTenants.length} / ${tenants.length} tenants`}
                </CardDescription>
              </div>
              <Input
                placeholder="Search tenants by name, ID, status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full sm:w-80"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading tenants…
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No tenants found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Tenant</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                                {tenant.tenant_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {tenant.tenant_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Tenant #{tenant.id}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created: {formatDateTime(tenant.created_at)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={tenant.is_active ? "success" : "secondary"}
                          >
                            {tenant.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDateTime(tenant.update_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
