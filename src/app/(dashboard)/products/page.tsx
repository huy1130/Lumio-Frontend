"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Trash2,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, cn } from "@/lib/utils";
import type {
  ApiProduct,
  ApiCategory,
  CreateProductPayload,
  ApiIngredient,
} from "@/types";
import { productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";
import { ingredientService } from "@/lib/services/ingredientService";
import { toast } from "sonner";

export default function ProductsPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <ProductsContent />
    </AccessGuard>
  );
}

function ProductsContent() {
  return <AdminProductsView />;
}

// ─── Category config ──────────────────────────────────────────────────────────
interface CategoryMeta {
  icon: string;
  activeColor: string;
  activeBg: string;
  borderColor: string;
}

const FALLBACK_META: CategoryMeta = {
  icon: "📦",
  activeColor: "text-indigo-700 dark:text-indigo-400",
  activeBg: "bg-indigo-50 dark:bg-indigo-900/30",
  borderColor: "border-indigo-500",
};

const AVATAR_PALETTE = [
  "bg-indigo-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-emerald-500",
];

function ProductAvatar({
  product,
  size = "md",
}: {
  product: ApiProduct;
  size?: "sm" | "md";
}) {
  const bg = AVATAR_PALETTE[product.id % AVATAR_PALETTE.length];
  const dim = size === "md" ? "h-16 w-16 text-xl" : "h-9 w-9 text-sm";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        bg,
        dim,
      )}
    >
      {product.product_name.charAt(0).toUpperCase()}
    </div>
  );
}

const EMPTY_FORM: CreateProductPayload = {
  category_id: 0,
  product_name: "",
  sku: "",
  basic_price: 0,
  unit_price: 0,
  barcode: "",
  description: "",
  measure_unit: "",
  is_active: true,
};

type RecipeItem = {
  ingredient_id: number;
  quantity_required: number;
  unit: string;
  name: string;
};

function AdminProductsView() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<ApiCategory[]>([]);
  const [dbIngredients, setDbIngredients] = useState<ApiIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formTab, setFormTab] = useState<"info" | "recipe">("info");
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, ingRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        ingredientService.getAll(),
      ]);
      setProducts(prodRes);
      setDbCategories(catRes);
      setDbIngredients(ingRes.filter((i) => i.is_active));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không tải được dữ liệu sản phẩm",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category?.category_name || "Chưa phân loại";
      map[catName] = (map[catName] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const catName = p.category?.category_name || "Chưa phân loại";
      const matchCat =
        selectedCategory === "all" || catName === selectedCategory;
      const matchText =
        !search ||
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchText;
    });
  }, [products, selectedCategory, search]);

  const categoryLabel =
    selectedCategory === "all"
      ? `Tất cả sản phẩm (${visibleProducts.length})`
      : `${selectedCategory} (${visibleProducts.length})`;

  function openCreate() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setRecipeItems([]);
    setFormTab("info");
    setFormOpen(true);
  }

  async function openEdit(product: ApiProduct) {
    setEditingProduct(product);
    setForm({
      category_id: product.category_id,
      product_name: product.product_name,
      sku: product.sku,
      basic_price: Number(product.basic_price),
      unit_price: Number(product.unit_price),
      barcode: product.barcode || "",
      description: product.description || "",
      measure_unit: product.measure_unit || "",
      is_active: product.is_active,
    });
    setFormError(null);
    setRecipeItems([]);
    setFormTab("info");
    setFormOpen(true);

    setLoadingRecipe(true);
    try {
      const links = await ingredientService.getByProduct(product.id);
      setRecipeItems(
        links.map((l) => ({
          ingredient_id: l.ingredient_id,
          quantity_required: Number(l.quantity_required),
          unit: l.ingredient?.unit || "",
          name: l.ingredient?.name || "Unknown",
        })),
      );
    } catch (err: unknown) {
      toast.error("Không tải được công thức của sản phẩm này.");
    } finally {
      setLoadingRecipe(false);
    }
  }

  function handleAddRecipeItem() {
    setRecipeItems([
      ...recipeItems,
      { ingredient_id: 0, quantity_required: 1, unit: "", name: "" },
    ]);
  }

  function handleRemoveRecipeItem(index: number) {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  }

  function handleRecipeItemChange(
    index: number,
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) {
    const newItems = [...recipeItems];
    if (field === "ingredient_id") {
      const ing = dbIngredients.find((i) => i.id === Number(value));
      newItems[index].ingredient_id = Number(value);
      newItems[index].unit = ing?.unit || "";
      newItems[index].name = ing?.name || "";
    } else if (field === "quantity_required") {
      newItems[index].quantity_required = Number(value);
    }
    setRecipeItems(newItems);
  }

  async function handleSave() {
    if (!form.product_name.trim()) {
      setFormError("Vui lòng nhập tên sản phẩm.");
      setFormTab("info");
      return;
    }
    if (!form.sku.trim()) {
      setFormError("Vui lòng nhập mã SKU.");
      setFormTab("info");
      return;
    }
    if (!form.category_id) {
      setFormError("Vui lòng chọn danh mục.");
      setFormTab("info");
      return;
    }
    if (form.basic_price < 0 || form.unit_price < 0) {
      setFormError("Giá không hợp lệ.");
      setFormTab("info");
      return;
    }

    if (
      recipeItems.some((r) => !r.ingredient_id || r.quantity_required <= 0)
    ) {
      setFormError(
        "Có dòng nguyên liệu trống hoặc số lượng không hợp lệ. Vui lòng kiểm tra lại tab Công thức.",
      );
      setFormTab("recipe");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      let productId = editingProduct?.id;

      if (editingProduct) {
        await productService.update(editingProduct.id, form);
      } else {
        const newProd = await productService.create(form);
        productId = newProd.id;
      }

      // Sync recipe if productId exists
      if (productId) {
        const currentLinks = editingProduct
          ? await ingredientService.getByProduct(productId)
          : [];
        const currentIds = currentLinks.map((l) => l.ingredient_id);
        const newIds = recipeItems.map((r) => r.ingredient_id);

        const toDelete = currentIds.filter((id) => !newIds.includes(id));
        for (const delId of toDelete) {
          await ingredientService.removeProductLink(productId, delId);
        }

        for (const item of recipeItems) {
          await ingredientService.upsertProductLink(productId, {
            ingredient_id: item.ingredient_id,
            quantity_required: item.quantity_required,
          });
        }
      }

      toast.success(
        editingProduct ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm mới",
      );
      setFormOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lưu sản phẩm thất bại";
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(product: ApiProduct) {
    try {
      if (product.is_active) {
        await productService.deactivate(product.id);
        toast.success("Đã vô hiệu hóa sản phẩm");
      } else {
        await productService.activate(product.id);
        toast.success("Đã kích hoạt sản phẩm");
      }
      await fetchData();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Đổi trạng thái thất bại",
      );
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-56 shrink-0 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-4 pt-5 pb-3 shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Danh mục sản phẩm
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
          <CategoryRow
            icon="🏪"
            label="Tất cả"
            count={products.length}
            active={selectedCategory === "all"}
            activeColor="text-indigo-700 dark:text-indigo-400"
            activeBg="bg-indigo-50 dark:bg-indigo-900/30"
            borderColor="border-indigo-500"
            onClick={() => setSelectedCategory("all")}
          />
          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
          {categories.map(({ name, count }) => (
            <CategoryRow
              key={name}
              icon={FALLBACK_META.icon}
              label={name}
              count={count}
              active={selectedCategory === name}
              activeColor={FALLBACK_META.activeColor}
              activeBg={FALLBACK_META.activeBg}
              borderColor={FALLBACK_META.borderColor}
              onClick={() => setSelectedCategory(name)}
            />
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm, SKU..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Filter className="h-4 w-4" /> Lọc
            </Button>
            <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 transition-colors",
                    viewMode === mode
                      ? "bg-indigo-600 text-white"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {mode === "grid" ? (
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
            <Button
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shrink-0"
              size="sm"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" /> Thêm sản phẩm
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">{FALLBACK_META.icon}</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {categoryLabel}
            </h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  <button
                    onClick={openCreate}
                    className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center transition-all hover:border-teal-400 hover:shadow-md min-h-[200px]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-500 group-hover:bg-teal-100">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
                      Thêm sản phẩm
                    </p>
                  </button>
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={() => openEdit(product)}
                      onToggleStatus={() => handleToggleStatus(product)}
                    />
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Giá vốn</TableHead>
                        <TableHead>Giá bán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleProducts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-16 text-center text-sm text-muted-foreground"
                          >
                            Chưa có sản phẩm nào.
                          </TableCell>
                        </TableRow>
                      ) : (
                        visibleProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <ProductAvatar product={product} size="sm" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {product.product_name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.measure_unit || "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                              {product.sku}
                            </TableCell>
                            <TableCell>
                              {product.category?.category_name || "—"}
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400">
                              {formatCurrency(Number(product.basic_price))}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(Number(product.unit_price))}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.is_active ? "success" : "secondary"
                                }
                              >
                                {product.is_active ? "Hoạt động" : "Tạm ngưng"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEdit(product)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {viewMode === "grid" && visibleProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {search
                      ? `Không có kết quả cho "${search}"`
                      : "Thêm sản phẩm đầu tiên của bạn để bắt đầu."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-2">
            <button
              type="button"
              onClick={() => setFormTab("info")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                formTab === "info"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              Thông tin cơ bản
            </button>
            <button
              type="button"
              onClick={() => setFormTab("recipe")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                formTab === "recipe"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              Định mức nguyên liệu (Recipe)
            </button>
          </div>

          <div className="min-h-[300px] overflow-y-auto pr-2">
            {formError && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20 mb-4">
                {formError}
              </div>
            )}

            {formTab === "info" && (
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="product_name">Tên sản phẩm *</Label>
                  <Input
                    id="product_name"
                    value={form.product_name}
                    onChange={(e) =>
                      setForm({ ...form, product_name: e.target.value })
                    }
                    placeholder="Ví dụ: Cà phê sữa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">Mã SKU *</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) =>
                      setForm({ ...form, sku: e.target.value })
                    }
                    placeholder="Mã duy nhất..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <select
                    id="category"
                    value={form.category_id || ""}
                    onChange={(e) =>
                      setForm({ ...form, category_id: Number(e.target.value) })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Chọn danh mục
                    </option>
                    {dbCategories
                      .filter((c) => c.is_active)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="basic_price">Giá vốn *</Label>
                    <Input
                      id="basic_price"
                      type="number"
                      min={0}
                      value={form.basic_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          basic_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit_price">Giá bán *</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      min={0}
                      value={form.unit_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          unit_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="measure_unit">Đơn vị đo</Label>
                    <Input
                      id="measure_unit"
                      value={form.measure_unit}
                      onChange={(e) =>
                        setForm({ ...form, measure_unit: e.target.value })
                      }
                      placeholder="Ly, cái, hộp..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={form.barcode}
                      onChange={(e) =>
                        setForm({ ...form, barcode: e.target.value })
                      }
                      placeholder="Mã vạch..."
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Sản phẩm đang bán
                  </span>
                </label>
              </div>
            )}

            {formTab === "recipe" && (
              <div className="py-2 space-y-4">
                {loadingRecipe ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      Cấu hình nguyên liệu cần thiết để tạo ra 1 đơn vị sản
                      phẩm này.
                    </p>
                    {recipeItems.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        Chưa có nguyên liệu nào. Nhấn Thêm nguyên liệu để cấu
                        hình.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recipeItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <select
                              value={item.ingredient_id || ""}
                              onChange={(e) =>
                                handleRecipeItemChange(
                                  index,
                                  "ingredient_id",
                                  e.target.value,
                                )
                              }
                              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="" disabled>
                                Chọn nguyên liệu
                              </option>
                              {dbIngredients.map((ing) => (
                                <option
                                  key={ing.id}
                                  value={ing.id}
                                  disabled={recipeItems.some(
                                    (r) =>
                                      r.ingredient_id === ing.id && r !== item,
                                  )}
                                >
                                  {ing.name}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              min={0.0001}
                              step="any"
                              className="w-24 h-10"
                              value={item.quantity_required}
                              onChange={(e) =>
                                handleRecipeItemChange(
                                  index,
                                  "quantity_required",
                                  e.target.value,
                                )
                              }
                            />
                            <span className="w-12 text-sm text-gray-500 truncate">
                              {item.unit || "—"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveRecipeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddRecipeItem}
                      className="w-full gap-2 border-dashed mt-2"
                    >
                      <Plus className="h-4 w-4" /> Thêm nguyên liệu
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu toàn bộ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CategoryRowProps {
  icon: string;
  label: string;
  count: number;
  active: boolean;
  activeColor: string;
  activeBg: string;
  borderColor: string;
  onClick: () => void;
}

function CategoryRow({
  icon,
  label,
  count,
  active,
  activeColor,
  activeBg,
  borderColor,
  onClick,
}: CategoryRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all text-left border-l-2",
        active
          ? [activeBg, activeColor, borderColor]
          : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
          active
            ? "bg-white/60 dark:bg-black/30"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ProductCard({
  product,
  onEdit,
  onToggleStatus,
}: {
  product: ApiProduct;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <div className="group relative flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
      <input
        type="checkbox"
        className="absolute top-3 left-3 h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={onToggleStatus}>
              {product.is_active ? (
                <>
                  <XCircle className="h-3.5 w-3.5 text-amber-500" /> Tạm ngưng
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Kích
                  hoạt
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ProductAvatar product={product} size="md" />
      <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
        {product.product_name}
      </p>
      <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {formatCurrency(Number(product.unit_price))}
      </p>
      <div className="mt-3 w-full">
        <Badge variant={product.is_active ? "success" : "secondary"}>
          {product.is_active ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>
    </div>
  );
}
