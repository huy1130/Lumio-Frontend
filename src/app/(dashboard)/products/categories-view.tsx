"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
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
import { categoryService } from "@/lib/services/categoryService";
import { productService } from "@/lib/services/productService";
import { cn, formatCurrency } from "@/lib/utils";
import type { ApiCategory, ApiProduct } from "@/types";
import { toast } from "sonner";

type CategoryFormState = {
  category_name: string;
  par_category_id: string;
  is_active: boolean;
};

type CategoryRow = {
  id: number;
  category_name: string;
  parent_name: string;
  child_count: number;
  depth: number;
  is_active: boolean;
  par_category_id: number | null;
};

const EMPTY_FORM: CategoryFormState = {
  category_name: "",
  par_category_id: "",
  is_active: true,
};

export function CategoriesView() {
  const { role } = useAuth();
  const canManage = role === "shop_owner";

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(
    null,
  );
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Xem chi tiết danh mục
  const [viewingCategory, setViewingCategory] = useState<ApiCategory | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        categoryService.getAll(),
        productService.getAll(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  function openCreate() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(category: ApiCategory) {
    setEditingCategory(category);
    setForm({
      category_name: category.category_name,
      par_category_id: category.par_category_id
        ? String(category.par_category_id)
        : "",
      is_active: category.is_active,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.category_name.trim()) {
      setFormError("Vui lòng nhập tên danh mục.");
      return;
    }

    const blockedParentIds = editingCategory
      ? collectDescendantIds(editingCategory)
      : new Set<number>();
    const parsedParentId = form.par_category_id
      ? Number(form.par_category_id)
      : null;

    if (parsedParentId != null) {
      if (editingCategory && parsedParentId === editingCategory.id) {
        setFormError("Danh mục không thể là cha của chính nó.");
        return;
      }

      if (blockedParentIds.has(parsedParentId)) {
        setFormError("Danh mục cha không hợp lệ vì sẽ tạo vòng lặp.");
        return;
      }
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        category_name: form.category_name.trim(),
        par_category_id: parsedParentId,
        is_active: form.is_active,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
        toast.success("Đã cập nhật danh mục");
      } else {
        await categoryService.create(payload);
        toast.success("Đã tạo danh mục");
      }

      setFormOpen(false);
      setEditingCategory(null);
      await fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lưu danh mục thất bại";
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
      await categoryService.delete(deleteTarget.id);
      toast.success("Đã xóa danh mục");
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Xóa danh mục thất bại";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const rows = useMemo(() => flattenCategories(categories), [categories]);
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      return (
        row.category_name.toLowerCase().includes(keyword) ||
        (row.is_active ? "active" : "inactive").includes(keyword)
      );
    });
  }, [rows, search]);

  const columns = useMemo<Column<CategoryRow>[]>(() => {
    const base: Column<CategoryRow>[] = [
      {
        key: "category_name",
        label: "Tên danh mục",
        render: (row) => (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.category_name}
          </div>
        ),
      },
      {
        key: "product_count",
        label: "Sản phẩm",
        render: (row) => {
          const count = products.filter(p => p.category_id === row.id).length;
          return (
            <Badge variant="outline" className="text-gray-600 dark:text-gray-300 font-medium">
              {count} sản phẩm
            </Badge>
          );
        },
      },
      {
        key: "is_active",
        label: "Trạng thái",
        render: (row) => (
          <Badge variant={row.is_active ? "success" : "secondary"}>
            {row.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
          </Badge>
        ),
      },
    ];

    if (canManage) {
      base.push({
        key: "actions",
        label: "Thao tác",
        render: (row) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              title="Xem sản phẩm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setViewingCategory(
                  categoryMap.get(row.id) ?? (null as unknown as ApiCategory),
                )
              }
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Sửa"
              className="h-8 w-8 p-0"
              onClick={() =>
                openEdit(
                  categoryMap.get(row.id) ?? (null as unknown as ApiCategory),
                )
              }
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Xóa"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() =>
                setDeleteTarget(
                  categoryMap.get(row.id) ?? (null as unknown as ApiCategory),
                )
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      });
    }

    return base;
  }, [canManage, categoryMap, products]);

  return (
    <div className="flex-1 overflow-y-auto h-full bg-gray-50/50 dark:bg-gray-950/50">
      <div className="p-6 space-y-6">
        <PageHeader
          title="Danh mục"
          description={
            canManage
              ? "Shopowner có thể tạo, sửa và ngừng hoạt động danh mục. Cashier chỉ được xem cây danh mục."
              : "Chế độ chỉ xem danh mục."
          }
          role={role}
          breadcrumbs={[{ label: "Shop Owner" }, { label: "Danh mục" }]}
          actions={
            canManage ? (
              <Button className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Thêm danh mục
              </Button>
            ) : undefined
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 dark:border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Tổng danh mục
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {rows.length}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 dark:border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Đang hoạt động
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {rows.filter((row) => row.is_active).length}
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
              onClick={() => void fetchData()}
            >
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Danh mục</CardTitle>
            <CardDescription>
              Danh mục lồng nhau được hiển thị trong một bảng để cashier có thể
              xem cấu trúc hiện tại.
            </CardDescription>
            <div className="max-w-md pt-2">
              <Input
                placeholder="Tìm theo tên danh mục, danh mục cha hoặc trạng thái..."
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
                data={filteredRows}
                emptyMessage={
                  search
                    ? "Không tìm thấy danh mục phù hợp."
                    : "Chưa có danh mục nào."
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
              {editingCategory ? "Sửa danh mục" : "Tạo danh mục"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Cập nhật tên và trạng thái của danh mục."
                : "Tạo một danh mục mới cho các sản phẩm."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="category_name">Tên danh mục</Label>
              <Input
                id="category_name"
                value={form.category_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category_name: e.target.value,
                  }))
                }
                placeholder="Ví dụ: Đồ uống"
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
                  Danh mục đang hoạt động
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Danh mục ngừng hoạt động vẫn hiển thị nhưng không nên dùng cho
                  sản phẩm mới.
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
              {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
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
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Thao tác này sẽ ngừng hoạt động "${deleteTarget.category_name}". Các danh mục con vẫn được giữ lại, nhưng danh mục này sẽ bị đánh dấu ngừng hoạt động.`
                : "Xác nhận xóa danh mục."}
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

      <Dialog
        open={viewingCategory != null}
        onOpenChange={(open) => !open && setViewingCategory(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sản phẩm thuộc "{viewingCategory?.category_name}"</DialogTitle>
            <DialogDescription>
              Danh sách các sản phẩm đang nằm trong danh mục này. Để thay đổi danh mục cho sản phẩm, vui lòng sang tab Sản phẩm để chỉnh sửa.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {products.filter((p) => p.category_id === viewingCategory?.id).length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                Chưa có sản phẩm nào thuộc danh mục này.
              </div>
            ) : (
              <div className="space-y-3">
                {products
                  .filter((p) => p.category_id === viewingCategory?.id)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 font-bold text-sm">
                          {product.product_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(Number(product.unit_price))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCategory(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function flattenCategories(
  categories: ApiCategory[],
  depth = 0,
  parentName = "Gốc",
): CategoryRow[] {
  const rows: CategoryRow[] = [];

  for (const category of categories) {
    const children = category.children ?? [];
    rows.push({
      id: category.id,
      category_name: category.category_name,
      parent_name: category.parent?.category_name ?? parentName,
      child_count: children.length,
      depth,
      is_active: category.is_active,
      par_category_id: category.par_category_id,
    });

    if (children.length > 0) {
      rows.push(
        ...flattenCategories(children, depth + 1, category.category_name),
      );
    }
  }

  return rows;
}

function buildCategoryMap(categories: ApiCategory[]): Map<number, ApiCategory> {
  const map = new Map<number, ApiCategory>();

  const visit = (items: ApiCategory[]) => {
    for (const item of items) {
      map.set(item.id, item);
      if (item.children?.length) visit(item.children);
    }
  };

  visit(categories);
  return map;
}

function collectDescendantIds(category: ApiCategory): Set<number> {
  const ids = new Set<number>();

  const visit = (items?: ApiCategory[]) => {
    for (const item of items ?? []) {
      ids.add(item.id);
      visit(item.children);
    }
  };

  visit(category.children);
  return ids;
}

function getParentOptions(
  categories: ApiCategory[],
  editingId?: number,
): Array<{ id: number; category_name: string; depth: number }> {
  const rows = flattenCategories(categories).filter(
    (category) => category.id !== editingId,
  );
  if (!editingId) return rows;

  const editingCategory = findCategoryById(categories, editingId);
  if (!editingCategory) return rows;

  const blocked = collectDescendantIds(editingCategory);
  blocked.add(editingId);

  return rows
    .filter((category) => !blocked.has(category.id))
    .map(({ id, category_name, depth }) => ({ id, category_name, depth }));
}

function findCategoryById(
  categories: ApiCategory[],
  id: number,
): ApiCategory | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    const match = findCategoryById(category.children ?? [], id);
    if (match) return match;
  }

  return undefined;
}
