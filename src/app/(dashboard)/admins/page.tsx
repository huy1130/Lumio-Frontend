"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
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
import { AccessGuard } from "@/components/shared/AccessGuard";
import { adminService } from "@/lib/services/adminService";
import type { ApiAdmin, CreateAdminPayload, UpdateAdminPayload } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const EMPTY_CREATE: CreateAdminPayload = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
};

function buildCreatePayload(form: CreateAdminPayload): CreateAdminPayload {
  const payload: CreateAdminPayload = {
    email: form.email.trim(),
    password: form.password,
  };
  const name = form.full_name?.trim();
  const phone = form.phone?.trim();
  if (name) payload.full_name = name;
  if (phone) payload.phone = phone;
  const avatar = form.avatar?.trim();
  if (avatar) payload.avatar = avatar;
  return payload;
}

// ─── page shell ───────────────────────────────────────────────────────────────

export default function AdminsPage() {
  return (
    <AccessGuard roles={["admin"]}>
      <AdminsContent />
    </AccessGuard>
  );
}

// ─── main content ─────────────────────────────────────────────────────────────

function AdminsContent() {
  const [admins, setAdmins] = useState<ApiAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateAdminPayload>(EMPTY_CREATE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // edit modal
  const [editTarget, setEditTarget] = useState<ApiAdmin | null>(null);
  const [editForm, setEditForm] = useState<UpdateAdminPayload>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // toggle
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ── create ─────────────────────────────────────────────────────────────────

  function openCreate() {
    setCreateForm(EMPTY_CREATE);
    setCreateError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    const payload = buildCreatePayload(createForm);
    if (!payload.email || !payload.password) {
      setCreateError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    if (payload.password.length < 6) {
      setCreateError("Mật khẩu tối thiểu 6 ký tự (theo backend).");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await adminService.create(payload);
      setAdmins((prev) => [...prev, created]);
      setCreateOpen(false);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  // ── edit ───────────────────────────────────────────────────────────────────

  function openEdit(admin: ApiAdmin) {
    setEditTarget(admin);
    setEditForm({
      email: admin.email,
      full_name: admin.full_name ?? "",
      phone: admin.phone ?? "",
    });
    setEditError(null);
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditing(true);
    setEditError(null);
    try {
      const updated = await adminService.update(editTarget.id, editForm);
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditTarget(null);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditing(false);
    }
  }

  // ── toggle ─────────────────────────────────────────────────────────────────

  async function handleToggle(admin: ApiAdmin) {
    setTogglingId(admin.id);
    try {
      const updated = admin.is_active
        ? await adminService.deactivate(admin.id)
        : await adminService.activate(admin.id);
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setTogglingId(null);
    }
  }

  // ── stats ──────────────────────────────────────────────────────────────────

  const total = admins.length;
  const active = admins.filter((a) => a.is_active).length;
  const inactive = admins.filter((a) => !a.is_active).length;
  const initial = admins.filter((a) => a.manager_id === null).length;

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
              onClick={fetchAdmins}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Admins</CardDescription>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-3xl">{total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Active</CardDescription>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </div>
                <CardTitle className="text-3xl text-green-600">
                  {active}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Inactive</CardDescription>
                  <UserX className="h-4 w-4 text-red-400" />
                </div>
                <CardTitle className="text-3xl text-muted-foreground">
                  {inactive}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Initial Admins</CardDescription>
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle className="text-3xl text-purple-600">
                  {initial}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admin Accounts</CardTitle>
              <CardDescription>
                {loading ? "Loading…" : `${total} admins`}
              </CardDescription>
            </div>
            <Button className="gap-2" onClick={openCreate} disabled={loading}>
              <Plus className="h-4 w-4" /> New Admin
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading admins…
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No admins found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">
                              {initials(admin.full_name, admin.email)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {admin.full_name ?? "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                #{admin.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{admin.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {admin.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          {admin.manager_id === null ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Initial
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Sub-admin</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={admin.is_active ? "success" : "secondary"}
                          >
                            {admin.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {admin.last_login
                            ? new Date(admin.last_login).toLocaleString("vi-VN")
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Edit"
                              onClick={() => openEdit(admin)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-8 w-8 p-0 ${admin.is_active ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}`}
                              title={
                                admin.is_active ? "Deactivate" : "Activate"
                              }
                              onClick={() => handleToggle(admin)}
                              disabled={togglingId === admin.id}
                            >
                              {togglingId === admin.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : admin.is_active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create Admin Modal ──────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Admin</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {createError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {createError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="c-email">Email *</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="admin@lumio.app"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="c-password">
                  Mật khẩu * (tối thiểu 6 ký tự)
                </Label>
                <Input
                  id="c-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full Name</Label>
                <Input
                  id="c-name"
                  value={createForm.full_name ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  placeholder="Nguyen Van A"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-phone">Phone</Label>
                <Input
                  id="c-phone"
                  value={createForm.phone ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="0901234567"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Admin Modal ────────────────────────────────────────────────── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {editError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="e-email">Email</Label>
                <Input
                  id="e-email"
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="e-password">
                  New Password (để trống nếu không đổi)
                </Label>
                <Input
                  id="e-password"
                  type="password"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      password: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-name">Full Name</Label>
                <Input
                  id="e-name"
                  value={editForm.full_name ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-phone">Phone</Label>
                <Input
                  id="e-phone"
                  value={editForm.phone ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
