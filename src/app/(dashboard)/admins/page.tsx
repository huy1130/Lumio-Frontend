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
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { canManageAdmins } from "@/lib/admin-access";
import { adminService } from "@/lib/services/adminService";
import {
  ADMIN_PASSWORD_HINT,
  ADMIN_PASSWORD_MIN_LENGTH,
  validateAdminPassword,
} from "@/lib/admin-password";
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
  const { user } = useAuth();
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
    const pwdError = validateAdminPassword(payload.password, { required: true });
    if (pwdError) {
      setCreateError(pwdError);
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
    const pwdError = validateAdminPassword(editForm.password);
    if (pwdError) {
      setEditError(pwdError);
      return;
    }
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

  const createPasswordInvalid =
    createForm.password.length > 0 &&
    createForm.password.length < ADMIN_PASSWORD_MIN_LENGTH;
  const editPasswordInvalid =
    !!editForm.password &&
    editForm.password.length < ADMIN_PASSWORD_MIN_LENGTH;

  const canManage = canManageAdmins(user, admins);
  const tableColSpan = canManage ? 7 : 6;

  const total = admins.length;
  const active = admins.filter((a) => a.is_active).length;
  const inactive = admins.filter((a) => !a.is_active).length;
  const initial = admins.filter((a) => a.manager_id === null).length;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <Header />
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <PageHeader
          title="Quản lý Admin"
          description="Quản lý danh sách tài khoản quản trị hệ thống."
          role={user?.role}
          breadcrumbs={[{ label: "Admin" }, { label: "Tài khoản Admin" }]}
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
              onClick={fetchAdmins}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Tổng số Admin"
              value={total}
              icon={<Users className="h-5 w-5" />}
              iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
            />
            <StatsCard
              title="Đang hoạt động"
              value={active}
              icon={<UserCheck className="h-5 w-5" />}
              iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
            />
            <StatsCard
              title="Bị khóa"
              value={inactive}
              icon={<UserX className="h-5 w-5" />}
              iconClassName="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
            />
            <StatsCard
              title="Admin Khởi tạo"
              value={initial}
              icon={<ShieldCheck className="h-5 w-5" />}
              iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300"
            />
          </div>
        )}

        {/* Table */}
        <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100/50 pb-5 bg-white/50 dark:border-gray-800/50 dark:bg-gray-900/50">
            <div>
              <CardTitle className="text-lg font-bold">Danh sách Tài khoản</CardTitle>
              <CardDescription className="text-[13px] mt-1">
                {loading ? "Đang tải dữ liệu..." : `Hiển thị ${total} tài khoản`}
              </CardDescription>
            </div>
            {canManage && (
              <Button 
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-5 font-semibold shadow-sm transition-all active:scale-95" 
                onClick={openCreate} 
                disabled={loading}
              >
                <Plus className="h-4 w-4" /> Thêm Admin
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading admins…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold text-gray-600 px-6 py-4">Tài khoản</TableHead>
                      <TableHead className="font-semibold text-gray-600">Email</TableHead>
                      <TableHead className="font-semibold text-gray-600">Số điện thoại</TableHead>
                      <TableHead className="font-semibold text-gray-600">Loại</TableHead>
                      <TableHead className="font-semibold text-gray-600">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-gray-600">Lần cuối đăng nhập</TableHead>
                      {canManage && (
                        <TableHead className="text-right font-semibold text-gray-600 px-6">Thao tác</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={tableColSpan}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No admins found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 font-bold shadow-sm dark:from-indigo-900/40 dark:to-blue-900/40 dark:text-indigo-300">
                              {initials(admin.full_name, admin.email)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {admin.full_name ?? "—"}
                              </p>
                              <p className="text-[13px] text-muted-foreground mt-0.5">
                                Mã ID: #{admin.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13.5px] font-medium">{admin.email}</TableCell>
                        <TableCell className="text-[13.5px] text-muted-foreground">
                          {admin.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          {admin.manager_id === null ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-purple-200 text-purple-700 bg-purple-50 font-semibold dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Khởi tạo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-600">Phụ tá</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={admin.is_active ? "success" : "secondary"}
                            className="font-medium"
                          >
                            {admin.is_active ? "Hoạt động" : "Bị khóa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[13.5px]">
                          {admin.last_login
                            ? new Date(admin.last_login).toLocaleString("vi-VN")
                            : "Chưa từng"}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right px-6">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Sửa"
                                onClick={() => openEdit(admin)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-8 w-8 rounded-full p-0 transition-colors",
                                  admin.is_active 
                                    ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" 
                                    : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                )}
                                title={
                                  admin.is_active ? "Khóa tài khoản" : "Mở khóa"
                                }
                                onClick={() => handleToggle(admin)}
                                disabled={togglingId === admin.id}
                              >
                                {togglingId === admin.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : admin.is_active ? (
                                  <ToggleRight className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5" />
                                )}
                              </Button>
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

      {/* ── Create Admin Modal (initial admin only) ───────────────────────────── */}
      {canManage && (
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
                  Mật khẩu * ({ADMIN_PASSWORD_HINT})
                </Label>
                <Input
                  id="c-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  minLength={ADMIN_PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                />
                {createForm.password.length > 0 &&
                  createForm.password.length < ADMIN_PASSWORD_MIN_LENGTH && (
                    <p className="text-xs text-destructive">
                      Mật khẩu phải có ít nhất {ADMIN_PASSWORD_MIN_LENGTH} ký
                      tự.
                    </p>
                  )}
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
            <Button
              onClick={handleCreate}
              disabled={creating || createPasswordInvalid}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* ── Edit Admin Modal (initial admin only) ─────────────────────────────── */}
      {canManage && (
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
                  Mật khẩu mới (để trống nếu không đổi — {ADMIN_PASSWORD_HINT})
                </Label>
                <Input
                  id="e-password"
                  type="password"
                  value={editForm.password ?? ""}
                  placeholder="••••••••"
                  minLength={ADMIN_PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm((f) => ({
                      ...f,
                      password: value === "" ? undefined : value,
                    }));
                    if (editError?.includes("Mật khẩu")) setEditError(null);
                  }}
                />
                {editForm.password &&
                  editForm.password.length < ADMIN_PASSWORD_MIN_LENGTH && (
                    <p className="text-xs text-destructive">
                      Mật khẩu phải có ít nhất {ADMIN_PASSWORD_MIN_LENGTH} ký
                      tự.
                    </p>
                  )}
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
            <Button onClick={handleEdit} disabled={editing || editPasswordInvalid}>
              {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
