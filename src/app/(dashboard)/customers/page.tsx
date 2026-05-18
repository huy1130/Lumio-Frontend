"use client";

import { useEffect, useMemo, useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import type { CreateCustomerPayload, Customer, Tenant } from "@/types";
import {
  BadgeCheck,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserRound,
  Users,
  Phone,
} from "lucide-react";

type CustomerFormState = {
  full_name: string;
  phone: string;
  tenant_id: string;
};

type FormErrors = Partial<Record<keyof CustomerFormState, string>>;

const emptyForm: CustomerFormState = {
  full_name: "",
  phone: "",
  tenant_id: "1",
};

const CUSTOMER_PAGE_SIZE = 20;

function normalizeCustomerList(payload: unknown): Customer[] {
  if (Array.isArray(payload)) return payload as Customer[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Customer[] }).data;
  }
  return [];
}

function getLoyaltyLabel(points: number) {
  if (points >= 1000) return { label: "VIP", tone: "success" as const };
  if (points >= 100) return { label: "Loyal", tone: "info" as const };
  if (points > 0) return { label: "Growing", tone: "warning" as const };
  return { label: "New", tone: "secondary" as const };
}

function getCustomerInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

function normalizeTenantList(payload: unknown): Tenant[] {
  if (Array.isArray(payload)) return payload as Tenant[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Tenant[] }).data;
  }
  return [];
}

export default function CustomersPage() {
  const { user, role } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);

  const visibleTenants = useMemo(() => {
    const activeTenants = tenants.filter(
      (tenant) => tenant.is_active !== false,
    );

    if (role !== "admin" && user?.tenant_id) {
      return activeTenants.filter((tenant) => tenant.id === user.tenant_id);
    }

    return activeTenants;
  }, [role, tenants, user?.tenant_id]);

  const tenantById = useMemo(() => {
    return new Map(tenants.map((tenant) => [tenant.id, tenant] as const));
  }, [tenants]);

  const canSubmit = Boolean(
    form.full_name.trim() &&
    form.phone.trim() &&
    form.tenant_id.trim() &&
    !saving,
  );

  const loadCustomers = async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch("/api/customers", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (payload as { message?: string })?.message ??
            "Không thể tải danh sách khách hàng",
        );
      }

      setCustomers(normalizeCustomerList(payload));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách khách hàng",
      );
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTenants = async () => {
    setTenantLoading(true);

    try {
      const response = await fetch("/api/tenants", { cache: "no-store" });
      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          (payload as { message?: string })?.message ??
            "Không thể tải danh sách tenant",
        );
      }

      setTenants(normalizeTenantList(payload));
    } catch (err) {
      setTenants([]);
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách tenant",
      );
    } finally {
      setTenantLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
    void loadTenants();
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;

    return customers.filter((customer) => {
      return [
        customer.full_name,
        customer.phone,
        String(customer.tenant_id),
        customer.member_rank ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [customers, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / CUSTOMER_PAGE_SIZE),
  );
  const currentPageCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * CUSTOMER_PAGE_SIZE;
    return filteredCustomers.slice(startIndex, startIndex + CUSTOMER_PAGE_SIZE);
  }, [currentPage, filteredCustomers]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const totalPoints = customers.reduce(
      (sum, customer) => sum + (customer.loyalty_point ?? 0),
      0,
    );
    const loyalCustomers = customers.filter(
      (customer) => (customer.loyalty_point ?? 0) > 0,
    ).length;
    const avgPoints =
      customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;

    return [
      {
        title: "Tổng khách hàng",
        value: customers.length,
        description: "Đang được quản lý",
        icon: Users,
      },
      {
        title: "Có điểm loyal",
        value: loyalCustomers,
        description: "Khách đã phát sinh mua hàng",
        icon: Star,
      },
      {
        title: "Tổng điểm",
        value: totalPoints,
        description: "Điểm loyalty hiện có",
        icon: BadgeCheck,
      },
      {
        title: "Điểm trung bình",
        value: avgPoints,
        description: "Trung bình trên mỗi khách",
        icon: UserRound,
      },
    ];
  }, [customers]);

  const pageStart =
    filteredCustomers.length === 0
      ? 0
      : (currentPage - 1) * CUSTOMER_PAGE_SIZE + 1;
  const pageEnd = Math.min(
    currentPage * CUSTOMER_PAGE_SIZE,
    filteredCustomers.length,
  );

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setForm({
      full_name: "",
      phone: "",
      tenant_id: String(visibleTenants[0]?.id ?? user?.tenant_id ?? ""),
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      full_name: customer.full_name,
      phone: customer.phone,
      tenant_id: String(customer.tenant_id ?? 1),
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();
    const tenantId = form.tenant_id.trim();

    if (!fullName) {
      nextErrors.full_name = "Vui lòng nhập họ tên";
    } else if (fullName.length < 2) {
      nextErrors.full_name = "Họ tên cần ít nhất 2 ký tự";
    }

    if (!phone) {
      nextErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{8,15}$/.test(phone)) {
      nextErrors.phone =
        "Số điện thoại chưa hợp lệ. Vui lòng nhập số điện thoại từ 8 đến 15 chữ số!";
    }

    if (!tenantId) {
      nextErrors.tenant_id = "Vui lòng chọn tenant";
    } else {
      const tenantNumber = Number(tenantId);
      if (!Number.isInteger(tenantNumber) || tenantNumber < 1) {
        nextErrors.tenant_id = "Tenant không hợp lệ";
      }
      if (
        visibleTenants.length > 0 &&
        !visibleTenants.some((tenant) => tenant.id === tenantNumber)
      ) {
        nextErrors.tenant_id = "Tenant không thuộc quyền của bạn";
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const payload: CreateCustomerPayload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      };

      if (form.tenant_id.trim()) {
        payload.tenant_id = Number(form.tenant_id.trim());
      }

      const response = await fetch(
        editingCustomer
          ? `/api/customers/${editingCustomer.id}`
          : "/api/customers",
        {
          method: editingCustomer ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (data as { message?: string })?.message ?? "Không thể lưu khách hàng",
        );
      }

      setIsFormOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm);
      await loadCustomers(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu khách hàng");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/customers/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (data as { message?: string })?.message ?? "Không thể xoá khách hàng",
        );
      }

      setDeleteTarget(null);
      await loadCustomers(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xoá khách hàng");
    } finally {
      setDeleting(false);
    }
  };

  const cardTone = loading ? "animate-pulse" : "";
  const tenantReady = !tenantLoading && visibleTenants.length > 0;

  return (
    <AccessGuard roles={["admin", "shop_owner", "cashier"]}>
      <div>
        <Header />
        <div className="p-6 space-y-6">
          <PageHeader
            title="Customers"
            description="Quản lý khách hàng và danh mục khách hàng"
            role={role}
            breadcrumbs={
              role === "shop_owner"
                ? [{ label: "Shop Owner" }, { label: "Customers" }]
                : [{ label: "Customers" }]
            }
            actions={
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={openCreateDialog}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Thêm khách hàng
                </Button>
                <Button
                  onClick={() => loadCustomers(true)}
                  className="bg-white text-slate-900 hover:bg-slate-100 border border-gray-200"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Làm mới
                </Button>
              </div>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className={`border-slate-200/80 shadow-sm ${cardTone}`}
                >
                  <CardContent className="flex items-start justify-between p-5">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="space-y-4 border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Danh sách khách hàng</CardTitle>
                  <CardDescription>
                    {filteredCustomers.length} / {customers.length} khách hàng
                    đang hiển thị
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm theo tên, số điện thoại, tenant..."
                    className="pl-9"
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải dữ liệu khách hàng...
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-800">
                    <Users className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Chưa có khách hàng phù hợp</p>
                    <p className="text-sm text-muted-foreground">
                      Hãy thêm khách hàng mới hoặc thử từ khóa khác.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.16em] text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Khách hàng</th>
                        <th className="px-6 py-4 font-semibold">
                          Số điện thoại
                        </th>
                        <th className="px-6 py-4 font-semibold">Tenant</th>
                        <th className="px-6 py-4 font-semibold">Rank</th>
                        <th className="px-6 py-4 font-semibold">Tích điểm</th>
                        <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageCustomers.map((customer) => {
                        const loyalty = customer.loyalty_point ?? 0;
                        const loyaltyMeta = getLoyaltyLabel(loyalty);

                        return (
                          <tr
                            key={customer.id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/30"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-semibold text-white shadow-sm">
                                  {getCustomerInitials(customer.full_name)}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {customer.full_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                              <div className="inline-flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {customer.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                              {tenantById.get(customer.tenant_id)
                                ?.tenant_name ??
                                `Tenant #${customer.tenant_id}`}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              >
                                {customer.member_rank ?? loyaltyMeta.label}
                              </Badge>
                            </td>
                            <td className="px-10 py-10">
                              <Badge
                                variant={loyaltyMeta.tone}
                                className="gap-1.5"
                              >
                                <Star className="h-3.5 w-3.5" />
                                {loyalty}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                              {formatDate(customer.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(customer)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Sửa
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteTarget(customer)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Xoá
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {filteredCustomers.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {pageStart}-{pageEnd} trên{" "}
                    {filteredCustomers.length} khách hàng
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((value) => Math.max(1, value - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Trang trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => {
                        const isActive = page === currentPage;
                        return (
                          <Button
                            key={page}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-9"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((value) =>
                          Math.min(totalPages, value + 1),
                        )
                      }
                      disabled={currentPage >= totalPages}
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer
                    ? "Chỉnh sửa khách hàng"
                    : "Thêm khách hàng mới"}
                </DialogTitle>
                <DialogDescription>
                  Điền thông tin cơ bản để tạo hoặc cập nhật hồ sơ khách hàng.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Họ tên *</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        full_name: event.target.value,
                      }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                  {formErrors.full_name && (
                    <p className="text-xs text-red-600">
                      {formErrors.full_name}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="0901234567"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tenant_id">Tenant *</Label>
                  <select
                    id="tenant_id"
                    value={form.tenant_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tenant_id: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus-visible:ring-offset-gray-900"
                    disabled={!tenantReady}
                  >
                    {!tenantReady ? (
                      <option value="">Đang tải tenant...</option>
                    ) : null}
                    {visibleTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.tenant_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.tenant_id && (
                    <p className="text-xs text-red-600">
                      {formErrors.tenant_id}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                >
                  Huỷ
                </Button>
                <Button onClick={submitForm} disabled={!canSubmit}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingCustomer ? "Lưu thay đổi" : "Tạo khách hàng"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Xoá khách hàng</DialogTitle>
                <DialogDescription>
                  Hành động này sẽ xoá hồ sơ khách hàng khỏi danh sách. Bạn có
                  chắc muốn tiếp tục không?
                </DialogDescription>
              </DialogHeader>

              {deleteTarget && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/50">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {deleteTarget.full_name}
                  </p>
                  <p className="text-muted-foreground">{deleteTarget.phone}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Không xoá
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Xoá ngay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AccessGuard>
  );
}
