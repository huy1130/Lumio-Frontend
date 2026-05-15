"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Loader2, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
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
  billing_cycle: "monthly",
  is_active: true,
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
      billing_cycle: sub.billing_cycle,
      is_active: sub.is_active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await subscriptionService.update(editing.id, form);
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success("Cập nhật thành công", {
          description: `Gói "${updated.package_code}" đã được cập nhật.`,
        });
      } else {
        const created = await subscriptionService.create(form);
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
      <div className="p-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs"
              onClick={fetchSubscriptions}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Plans</CardDescription>
                <CardTitle className="text-3xl">
                  {subscriptions.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Plans</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {subscriptions.filter((s) => s.is_active).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inactive Plans</CardDescription>
                <CardTitle className="text-3xl text-muted-foreground">
                  {subscriptions.filter((s) => !s.is_active).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                {loading ? "Loading…" : `${subscriptions.length} plans`}
              </CardDescription>
            </div>
            {isRealAdmin && (
              <Button className="gap-2" onClick={openCreate} disabled={loading}>
                <Plus className="h-4 w-4" /> New Plan
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading subscriptions…
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    {isRealAdmin && (
                      <TableHead className="text-right">Actions</TableHead>
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
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.package_code}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {sub.description ?? "—"}
                        </TableCell>
                        <TableCell>{formatPrice(sub.price)}</TableCell>
                        <TableCell className="capitalize">
                          {sub.billing_cycle}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sub.is_active ? "success" : "secondary"}
                          >
                            {sub.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(sub.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        {isRealAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit"
                                onClick={() => openEdit(sub)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
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
                <Input
                  id="billing_cycle"
                  value={form.billing_cycle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, billing_cycle: e.target.value }))
                  }
                  placeholder="monthly / yearly"
                />
              </div>
            </div>

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
