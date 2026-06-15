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
import { customerService } from "@/lib/services/customerService";
import { tenantService } from "@/lib/services/tenantService";

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
  const isTenantScoped = role !== "admin" && user?.tenant_id != null;
  const scopedTenantId = isTenantScoped ? Number(user!.tenant_id) : null;
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
    (isTenantScoped || form.tenant_id.trim()) &&
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
      const payload = await customerService.getAll();
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
      const payload = await tenantService.getAll();
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
    if (!isTenantScoped) {
      void loadTenants();
    } else {
      setTenantLoading(false);
    }
  }, [isTenantScoped]);

  const tenantScopedCustomers = useMemo(() => {
    if (!isTenantScoped || scopedTenantId == null) return customers;
    return customers.filter((c) => c.tenant_id === scopedTenantId);
  }, [customers, isTenantScoped, scopedTenantId]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const base = tenantScopedCustomers;
    if (!keyword) return base;

    return base.filter((customer) => {
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
  }, [tenantScopedCustomers, search]);

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
    const totalPoints = tenantScopedCustomers.reduce(
      (sum, customer) => sum + (customer.loyalty_point ?? 0),
      0,
    );
    const loyalCustomers = tenantScopedCustomers.filter(
      (customer) => (customer.loyalty_point ?? 0) > 0,
    ).length;
    const avgPoints =
      tenantScopedCustomers.length > 0
        ? Math.round(totalPoints / tenantScopedCustomers.length)
        : 0;

    return [
      {
        title: "Tổng khách hàng",
        value: tenantScopedCustomers.length,
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
  }, [tenantScopedCustomers]);

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
      tenant_id: String(scopedTenantId ?? visibleTenants[0]?.id ?? ""),
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
    const tenantId = isTenantScoped
      ? String(scopedTenantId ?? "")
      : form.tenant_id.trim();

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

    if (!isTenantScoped && !tenantId) {
      nextErrors.tenant_id = "Vui lòng chọn tenant";
    } else if (tenantId) {
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

      const resolvedTenantId = isTenantScoped
        ? scopedTenantId
        : form.tenant_id.trim()
          ? Number(form.tenant_id.trim())
          : undefined;
      if (resolvedTenantId != null) {
        payload.tenant_id = resolvedTenantId;
      }

      if (editingCustomer) {
        await customerService.update(editingCustomer.id, payload);
      } else {
        await customerService.create(payload);
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
      await customerService.delete(deleteTarget.id);

      setDeleteTarget(null);
      await loadCustomers(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xoá khách hàng");
    } finally {
      setDeleting(false);
    }
  };

  const cardTone = loading ? "animate-pulse" : "";
  const tenantReady =
    isTenantScoped && scopedTenantId != null
      ? true
      : !tenantLoading && visibleTenants.length > 0;

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
                  className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm rounded-xl px-5 h-10 font-semibold transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Thêm khách hàng
                </Button>
                <Button
                  onClick={() => loadCustomers(true)}
                  variant="outline"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-xl h-10 font-semibold shadow-sm transition-all active:scale-95"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
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
                  className={`border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden relative group dark:bg-gray-900/50 ${cardTone}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Icon className="w-24 h-24 text-blue-500" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
            <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5 bg-white/50 dark:bg-gray-900/50">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Danh sách khách hàng</CardTitle>
                  <CardDescription className="text-[13px] mt-1">
                    {filteredCustomers.length} / {tenantScopedCustomers.length}{" "}
                    khách hàng đang hiển thị
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm theo tên, số điện thoại..."
                    className="pl-9 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 mt-4">
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
                  <table className="w-full min-w-[960px] text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/30">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Khách hàng</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Số điện thoại</th>
                        {!isTenantScoped ? (
                          <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Tenant</th>
                        ) : null}
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Rank</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Tích điểm</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Ngày tạo</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageCustomers.map((customer) => {
                        const loyalty = customer.loyalty_point ?? 0;
                        const loyaltyMeta = getLoyaltyLabel(loyalty);

                        return (
                          <tr
                            key={customer.id}
                            className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 dark:border-gray-800/50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-700 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-indigo-400 flex items-center justify-center font-bold text-sm transition-transform hover:scale-105 shadow-sm">
                                  {getCustomerInitials(customer.full_name)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">{customer.full_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">
                              <div className="inline-flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                {customer.phone}
                              </div>
                            </td>
                            {!isTenantScoped ? (
                              <td className="px-6 py-4 text-[13px] font-medium text-gray-600 dark:text-gray-400">
                                {tenantById.get(customer.tenant_id)?.tenant_name ?? `Tenant #${customer.tenant_id}`}
                              </td>
                            ) : null}
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest"
                              >
                                {customer.member_rank ?? loyaltyMeta.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <Star className={`h-4 w-4 ${loyalty > 0 ? "text-orange-400 fill-orange-400" : "text-gray-300"}`} />
                                <span className="font-semibold text-gray-900 dark:text-white">{loyalty}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                              {formatDate(customer.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                  onClick={() => openEditDialog(customer)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                  onClick={() => setDeleteTarget(customer)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

                {!isTenantScoped ? (
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
                ) : null}
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
