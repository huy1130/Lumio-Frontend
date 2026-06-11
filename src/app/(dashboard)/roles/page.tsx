"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Shield,
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
import { roleService } from "@/lib/services/roleService";
import type { ApiRole, CreateRolePayload } from "@/types";
import { toast } from "sonner";

const EMPTY_FORM: CreateRolePayload = {
  role_code: "",
  description: "",
  permissions: undefined,
};



export default function RolesPage() {
  return (
    <AccessGuard roles={["admin"]}>
      <RolesContent />
    </AccessGuard>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiRole | null>(null);
  const [form, setForm] = useState<CreateRolePayload>(EMPTY_FORM);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApiRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchRoles() {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.getAll();
      setRoles(data);
      const perms = await roleService.getPermissions();
      setAvailablePermissions(perms);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách role");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchRoles();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      role_code: "",
      description: "",
      permissions: {},
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(role: ApiRole) {
    setEditing(role);
    setForm({
      role_code: role.role_code,
      description: role.description ?? "",
      permissions: role.permissions ?? {},
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.role_code.trim()) {
      setFormError("Vui lòng nhập role_code.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateRolePayload = {
        role_code: form.role_code.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        permissions: form.permissions || {},
      };

      if (editing) {
        const updated = await roleService.update(editing.id, payload);
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast.success("Đã cập nhật role");
      } else {
        const created = await roleService.create(payload);
        setRoles((prev) => [...prev, created]);
        toast.success("Đã tạo role");
      }
      setModalOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lưu thất bại";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await roleService.delete(deleteTarget.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Đã xóa role");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs"
              onClick={() => void fetchRoles()}
            >
              Retry
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vai trò hệ thống
              </CardTitle>
              <CardDescription>
                Quản lý role_code dùng cho phân quyền API (SHOPOWNER, CASHIER…)
              </CardDescription>
            </div>
            <Button className="gap-2" onClick={openCreate} disabled={loading}>
              <Plus className="h-4 w-4" /> Thêm role
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải…
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Role code</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Chưa có role nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="text-muted-foreground">
                          #{role.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.role_code}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {role.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {role.permissions
                            ? `${Object.keys(role.permissions).length} key(s)`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => openEdit(role)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => setDeleteTarget(role)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa role" : "Tạo role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="role_code">Role code *</Label>
              <Input
                id="role_code"
                value={form.role_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role_code: e.target.value }))
                }
                placeholder="SHOPOWNER"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quyền hạn (Permissions)</Label>
              {availablePermissions.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">Đang tải danh sách quyền từ hệ thống...</div>
              ) : (
                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 border rounded-lg p-3 bg-gray-50/50 dark:bg-gray-900/30">
                  {availablePermissions.map((group) => (
                    <div key={group.module} className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{group.module}</h4>
                      <div className="grid gap-2">
                        {group.permissions.map((p: any) => {
                          const isChecked = !!(form.permissions as Record<string, any>)?.[p.key];
                          return (
                            <label key={p.key} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                checked={isChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setForm((prev) => {
                                    const currentPerms = { ...(prev.permissions as Record<string, any> || {}) };
                                    if (checked) {
                                      currentPerms[p.key] = true;
                                    } else {
                                      delete currentPerms[p.key];
                                    }
                                    return { ...prev, permissions: currentPerms };
                                  });
                                }}
                              />
                              <div>
                                <span className="font-semibold block">{p.key}</span>
                                <span className="text-[11px] text-muted-foreground">{p.name}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa role?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Xóa role <strong>{deleteTarget?.role_code}</strong>. User đang gán role này có thể bị lỗi.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
