"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Loader2, AlertCircle, Package, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscriptionService } from "@/lib/services/subscriptionService";
import {
  BILLING_CYCLE_OPTIONS,
  normalizeBillingCycle,
} from "@/lib/billing-cycle";
import { formatCurrency } from "@/lib/utils";
import type { ApiSubscription, CreateSubscriptionPayload } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: string) {
  return formatCurrency(parseFloat(price));
}

const EMPTY_FORM: CreateSubscriptionPayload = {
  package_code: "",
  description: "",
  price: 0,
  billing_cycle: "MONTHLY",
  is_active: true,
  max_shops: undefined,
};

// ─── page shell ───────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  return <SubscriptionsContent />;
}

// ─── main content ─────────────────────────────────────────────────────────────

function SubscriptionsContent() {
  const { isRealAdmin } = useAuth();

  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state (admin only)
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiSubscription | null>(null);
  const [form, setForm] = useState<CreateSubscriptionPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // toggling activate/deactivate (admin only)
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  async function fetchSubscriptions() {
    setLoading(true);
    setError(null);
    try {
      if (isRealAdmin) {
        const data = await subscriptionService.getAll();
        setSubscriptions(data);
      } else {
        const res = await fetch("/api/public/subscriptions");
        if (!res.ok) throw new Error("Failed to load subscriptions");
        const raw: unknown = await res.json();
        const data: ApiSubscription[] = Array.isArray(raw)
          ? raw
          : raw &&
              typeof raw === "object" &&
              Array.isArray((raw as { data?: ApiSubscription[] }).data)
            ? (raw as { data: ApiSubscription[] }).data
            : [];
        setSubscriptions(data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, [isRealAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── modal helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(sub: ApiSubscription) {
    setEditing(sub);
    setForm({
      package_code: sub.package_code,
      description: sub.description ?? "",
      price: parseFloat(sub.price),
      billing_cycle: normalizeBillingCycle(sub.billing_cycle),
      is_active: sub.is_active,
      max_shops: undefined,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await subscriptionService.update(editing.id, {
          ...form,
          billing_cycle: normalizeBillingCycle(form.billing_cycle),
        });
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success("Cập nhật thành công", {
          description: `Gói "${updated.package_code}" đã được cập nhật.`,
        });
      } else {
        const payload: CreateSubscriptionPayload = {
          ...form,
          billing_cycle: normalizeBillingCycle(form.billing_cycle),
          max_shops:
            form.max_shops != null && form.max_shops > 0
              ? form.max_shops
              : undefined,
        };
        const created = await subscriptionService.create(payload);
        setSubscriptions((prev) => [...prev, created]);
        toast.success("Tạo gói thành công", {
          description: `Gói "${created.package_code}" đã được tạo.`,
        });
      }
      setModalOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setFormError(msg);
      toast.error(editing ? "Cập nhật thất bại" : "Tạo gói thất bại", {
        description: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  // ── toggle active ──────────────────────────────────────────────────────────

  async function handleToggle(sub: ApiSubscription) {
    setTogglingId(sub.id);
    try {
      const updated = sub.is_active
        ? await subscriptionService.deactivate(sub.id)
        : await subscriptionService.activate(sub.id);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      if (updated.is_active) {
        toast.success("Kích hoạt thành công", {
          description: `Gói "${updated.package_code}" đã được kích hoạt.`,
        });
      } else {
        toast.info("Đã vô hiệu hóa", {
          description: `Gói "${updated.package_code}" đã bị vô hiệu hóa.`,
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Toggle failed";
      setError(msg);
      toast.error("Thao tác thất bại", { description: msg });
    } finally {
      setTogglingId(null);
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <Header />
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <PageHeader
          title="Gói Dịch Vụ (Subscriptions)"
          description="Quản lý và thiết lập các gói dịch vụ dành cho cửa hàng."
          breadcrumbs={[{ label: "Admin" }, { label: "Gói Dịch Vụ" }]}
        />

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs font-semibold hover:bg-destructive/20"
              onClick={fetchSubscriptions}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard
              title="Tổng số Gói"
              value={subscriptions.length}
              icon={<Package className="h-5 w-5" />}
              iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
            />
            <StatsCard
              title="Đang cung cấp"
              value={subscriptions.filter((s) => s.is_active).length}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
            />
            <StatsCard
              title="Tạm ngưng"
              value={subscriptions.filter((s) => !s.is_active).length}
              icon={<XCircle className="h-5 w-5" />}
              iconClassName="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
            />
          </div>
        )}

        {/* Table */}
        <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100/50 pb-5 bg-white/50 dark:border-gray-800/50 dark:bg-gray-900/50">
            <div>
              <CardTitle className="text-lg font-bold">Danh sách Gói Dịch vụ</CardTitle>
              <CardDescription className="text-[13px] mt-1">
                {loading ? "Đang tải dữ liệu..." : `Hiển thị ${subscriptions.length} gói`}
              </CardDescription>
            </div>
            {isRealAdmin && (
              <div className="flex gap-2">
                <Button 
                  className="gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-5 font-semibold shadow-sm transition-all active:scale-95" 
                  onClick={openCreate} 
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" /> Tạo Gói Mới
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading subscriptions…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold text-gray-600 px-6 py-4">Mã gói</TableHead>
                      <TableHead className="font-semibold text-gray-600">Mô tả</TableHead>
                      <TableHead className="font-semibold text-gray-600">Giá (VNĐ)</TableHead>
                      <TableHead className="font-semibold text-gray-600">Chu kỳ</TableHead>
                      <TableHead className="font-semibold text-gray-600">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-gray-600">Ngày tạo</TableHead>
                      {isRealAdmin && (
                        <TableHead className="text-right font-semibold text-gray-600 px-6">Thao tác</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isRealAdmin ? 7 : 6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {isRealAdmin
                          ? "No subscription plans yet. Create your first plan."
                          : "Chưa có gói dịch vụ nào."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow key={sub.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-semibold px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs dark:bg-indigo-900/30 dark:text-indigo-300">
                            {sub.package_code}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[13.5px] max-w-xs truncate">
                          {sub.description ?? "—"}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatPrice(sub.price)}
                        </TableCell>
                        <TableCell className="text-[13.5px]">
                          {sub.billing_cycle === 'MONTHLY' ? 'Hàng tháng' : sub.billing_cycle === 'YEARLY' ? 'Hàng năm' : sub.billing_cycle}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sub.is_active ? "success" : "secondary"}
                            className="font-medium"
                          >
                            {sub.is_active ? "Hoạt động" : "Tạm ngưng"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[13.5px]">
                          {new Date(sub.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        {isRealAdmin && (
                          <TableCell className="text-right px-6">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Sửa"
                                onClick={() => openEdit(sub)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Toggle active pill button */}
                              <button
                                title={
                                  sub.is_active
                                    ? "Nhấn để vô hiệu hóa"
                                    : "Nhấn để kích hoạt"
                                }
                                onClick={() => handleToggle(sub)}
                                disabled={togglingId === sub.id}
                                className={`
                                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
                                  rounded-full border-2 border-transparent transition-colors duration-200
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                  disabled:cursor-not-allowed disabled:opacity-50
                                  ${
                                    sub.is_active
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-input hover:bg-muted-foreground/30"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    pointer-events-none inline-flex h-4 w-4 items-center justify-center
                                    rounded-full bg-white shadow-md ring-0 transition-transform duration-200
                                    ${sub.is_active ? "translate-x-5" : "translate-x-0"}
                                  `}
                                >
                                  {togglingId === sub.id && (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin text-gray-400" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Subscription Plan" : "New Subscription Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="package_code">Package Code *</Label>
              <Input
                id="package_code"
                value={form.package_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, package_code: e.target.value }))
                }
                placeholder="e.g. STARTER_MONTHLY"
                disabled={!!editing}
              />
              {editing && (
                <p className="text-xs text-muted-foreground">
                  Package code cannot be changed after creation.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Short description of this plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                <select
                  id="billing_cycle"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={normalizeBillingCycle(form.billing_cycle)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, billing_cycle: e.target.value }))
                  }
                >
                  {BILLING_CYCLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="max_shops">Số cửa hàng tối đa (MAX_SHOPS)</Label>
                <Input
                  id="max_shops"
                  type="number"
                  min={1}
                  placeholder="vd. 3 — để trống nếu không giới hạn"
                  value={form.max_shops ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setForm((f) => ({
                      ...f,
                      max_shops: raw === "" ? undefined : Number(raw),
                    }));
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Khi tạo gói, BE tự gắn feature MAX_SHOPS với limit này.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.is_active ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
