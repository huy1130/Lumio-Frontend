"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FlaskConical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { DataTable, type Column } from "@/components/shared/DataTable";
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
import { ingredientService } from "@/lib/services/ingredientService";
import type { ApiIngredient } from "@/types";
import { toast } from "sonner";

type IngredientFormState = {
  name: string;
  unit: string;
  description: string;
  is_active: boolean;
};

const EMPTY_FORM: IngredientFormState = {
  name: "",
  unit: "",
  description: "",
  is_active: true,
};

const UNIT_SUGGESTIONS = ["kg", "g", "l", "ml", "cái", "gói", "hộp"];

/** Satisfies DataTable generic `Record<string, unknown>` */
type IngredientRow = ApiIngredient & Record<string, unknown>;

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function IngredientsPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <IngredientsContent />
    </AccessGuard>
  );
}

function IngredientsContent() {
  const { role } = useAuth();

  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiIngredient | null>(null);
  const [form, setForm] = useState<IngredientFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApiIngredient | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchIngredients() {
    setLoading(true);
    setError(null);
    try {
      const data = await ingredientService.getAll();
      setIngredients(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách nguyên liệu",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchIngredients();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: ApiIngredient) {
    setEditing(item);
    setForm({
      name: item.name,
      unit: item.unit ?? "",
      description: item.description ?? "",
      is_active: item.is_active,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên nguyên liệu.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim() || undefined,
        description: form.description.trim() || undefined,
        is_active: form.is_active,
      };

      if (editing) {
        await ingredientService.update(editing.id, payload);
        toast.success("Đã cập nhật nguyên liệu");
      } else {
        await ingredientService.create(payload);
        toast.success("Đã tạo nguyên liệu");
      }

      setFormOpen(false);
      setEditing(null);
      await fetchIngredients();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lưu nguyên liệu thất bại";
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await ingredientService.delete(deleteTarget.id);
      toast.success("Đã xóa nguyên liệu");
      setDeleteTarget(null);
      await fetchIngredients();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Xóa nguyên liệu thất bại";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return ingredients;

    return ingredients.filter((item) => {
      const status = item.is_active ? "active" : "inactive";
      return (
        item.name.toLowerCase().includes(keyword) ||
        (item.unit ?? "").toLowerCase().includes(keyword) ||
        (item.description ?? "").toLowerCase().includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [ingredients, search]);

  const activeCount = ingredients.filter((i) => i.is_active).length;

  const tableRows = filtered as IngredientRow[];

  const columns = useMemo<Column<IngredientRow>[]>(
    () => [
      {
        key: "name",
        label: "Tên nguyên liệu",
        render: (row) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <FlaskConical className="h-4 w-4" />
            </span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {row.name}
              </div>
              {row.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {row.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "unit",
        label: "Đơn vị",
        render: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {row.unit || "—"}
          </span>
        ),
      },
      {
        key: "is_active",
        label: "Trạng thái",
        render: (row) => (
          <Badge variant={row.is_active ? "success" : "secondary"}>
            {row.is_active ? "Đang dùng" : "Ngừng dùng"}
          </Badge>
        ),
      },
      {
        key: "created_at",
        label: "Ngày tạo",
        render: (row) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.created_at)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (row) => (
          <div className="flex justify-start gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openEdit(row)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Nguyên liệu"
          description="Quản lý nguyên liệu dùng cho công thức sản phẩm và tồn kho."
          role={role}
          breadcrumbs={[{ label: "Shop Owner" }, { label: "Nguyên liệu" }]}
          actions={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Thêm nguyên liệu
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 dark:border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Tổng nguyên liệu
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {ingredients.length}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 dark:border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Đang dùng
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {activeCount}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 dark:border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Ngừng dùng
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {ingredients.length - activeCount}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs"
              onClick={() => void fetchIngredients()}
            >
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Danh sách nguyên liệu</CardTitle>
            <CardDescription>
              Nguyên liệu thuộc tenant của bạn. Dùng cho công thức sản phẩm và
              quản lý kho sau này.
            </CardDescription>
            <div className="max-w-md pt-2">
              <Input
                placeholder="Tìm theo tên, đơn vị, mô tả hoặc trạng thái..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={tableRows}
                emptyMessage={
                  search
                    ? "Không tìm thấy nguyên liệu phù hợp."
                    : "Chưa có nguyên liệu nào. Nhấn «Thêm nguyên liệu» để bắt đầu."
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa nguyên liệu" : "Tạo nguyên liệu"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Cập nhật thông tin nguyên liệu."
                : "Thêm nguyên liệu mới cho cửa hàng của bạn."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="ingredient_name">Tên nguyên liệu *</Label>
              <Input
                id="ingredient_name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ví dụ: Sữa tươi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ingredient_unit">Đơn vị</Label>
              <Input
                id="ingredient_unit"
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="Ví dụ: l, kg, gói"
                list="unit-suggestions"
              />
              <datalist id="unit-suggestions">
                {UNIT_SUGGESTIONS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ingredient_description">Mô tả</Label>
              <Input
                id="ingredient_description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ghi chú thêm (tuỳ chọn)"
              />
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <span>
                <span className="block font-medium text-gray-900 dark:text-gray-100">
                  Nguyên liệu đang dùng
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Nguyên liệu ngừng dùng vẫn giữ trong hệ thống nhưng không nên
                  gán vào công thức mới.
                </span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Tạo nguyên liệu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa nguyên liệu</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Bạn có chắc muốn xóa "${deleteTarget.name}"? Thao tác này không thể hoàn tác nếu nguyên liệu chưa được dùng ở nơi khác.`
                : "Xác nhận xóa nguyên liệu."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
