"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  Pencil,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { tenantService } from "@/lib/services/tenantService";
import type { Tenant, UpdateTenantPayload } from "@/types";

type TenantFormState = {
  tenant_name: string;
  admin_id: string;
  tax_percentage: string;
  loyal_point_per_unit: string;
};

const EMPTY_FORM: TenantFormState = {
  tenant_name: "",
  admin_id: "",
  tax_percentage: "",
  loyal_point_per_unit: "",
};

function toNullableNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatMaybeNumber(
  value: number | string | null | undefined,
  digits = 2,
) {
  if (value == null || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return parsed.toLocaleString("vi-VN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return `${parsed.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function normalizeTenantForm(tenant: Tenant): TenantFormState {
  return {
    tenant_name: tenant.tenant_name ?? "",
    admin_id: tenant.admin_id != null ? String(tenant.admin_id) : "",
    tax_percentage:
      tenant.tax_percentage != null ? String(tenant.tax_percentage) : "",
    loyal_point_per_unit:
      tenant.loyal_point_per_unit != null
        ? String(tenant.loyal_point_per_unit)
        : "",
  };
}

function buildUpdatePayload(form: TenantFormState): UpdateTenantPayload {
  const payload: UpdateTenantPayload = {
    tenant_name: form.tenant_name.trim(),
  };

  const adminId = toNullableNumber(form.admin_id);
  const taxPercentage = toNullableNumber(form.tax_percentage);
  const loyalPointPerUnit = toNullableNumber(form.loyal_point_per_unit);

  if (adminId != null) payload.admin_id = adminId;
  if (taxPercentage != null) payload.tax_percentage = taxPercentage;
  if (loyalPointPerUnit != null)
    payload.loyal_point_per_unit = loyalPointPerUnit;

  return payload;
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
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState<TenantFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

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
    const withAdmin = tenants.filter(
      (tenant) => tenant.admin_id != null,
    ).length;

    return { total, active, inactive, withAdmin };
  }, [tenants]);

  const openEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setForm(normalizeTenantForm(tenant));
  };

  const closeEdit = () => {
    if (saving) return;
    setEditingTenant(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!editingTenant) return;

    const tenantName = form.tenant_name.trim();
    if (!tenantName) {
      setError("Vui lòng nhập tên tenant.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildUpdatePayload({ ...form, tenant_name: tenantName });
      const updated = await tenantService.update(editingTenant.id, payload);
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === updated.id ? updated : tenant)),
      );
      closeEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật tenant",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (tenant: Tenant) => {
    setActionId(tenant.id);
    setError(null);

    try {
      const updated = tenant.is_active
        ? await tenantService.deactivate(tenant.id)
        : await tenantService.activate(tenant.id);

      setTenants((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể thay đổi trạng thái tenant",
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tenants"
          description="Quản lý danh sách tenant, cập nhật thông tin và bật/tắt trạng thái hoạt động."
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
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tenant List</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading…"
                  : `${filteredTenants.length} / ${tenants.length} tenants`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tenants by name, ID, admin..."
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
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Tenant</th>
                      <th className="px-4 py-3 font-medium">Admin</th>
                      <th className="px-4 py-3 font-medium">Tax %</th>
                      <th className="px-4 py-3 font-medium">
                        Loyal Point / Unit
                      </th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold dark:bg-sky-900 dark:text-sky-300">
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
                        <td className="px-4 py-4 text-muted-foreground">
                          {tenant.admin_id ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          {formatPercent(tenant.tax_percentage)}
                        </td>
                        <td className="px-4 py-4">
                          {formatMaybeNumber(tenant.loyal_point_per_unit, 4)}
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
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit tenant"
                              onClick={() => openEdit(tenant)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 ${tenant.is_active ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}`}
                              title={
                                tenant.is_active ? "Deactivate" : "Activate"
                              }
                              onClick={() => void handleToggle(tenant)}
                              disabled={actionId === tenant.id}
                            >
                              {actionId === tenant.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : tenant.is_active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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

      <Dialog
        open={editingTenant != null}
        onOpenChange={(open) => !open && closeEdit()}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">Tenant name</Label>
              <Input
                id="tenant_name"
                value={form.tenant_name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    tenant_name: event.target.value,
                  }))
                }
                placeholder="Enter tenant name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="admin_id">Admin ID</Label>
                <Input
                  id="admin_id"
                  value={form.admin_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      admin_id: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_percentage">Tax %</Label>
                <Input
                  id="tax_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.tax_percentage}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tax_percentage: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loyal_point_per_unit">Loyal point / unit</Label>
                <Input
                  id="loyal_point_per_unit"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={form.loyal_point_per_unit}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      loyal_point_per_unit: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
