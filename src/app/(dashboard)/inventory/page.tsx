"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Package,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Warehouse,
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
import { setActiveShopId } from "@/lib/active-shop";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { ingredientService } from "@/lib/services/ingredientService";
import { inventoryService } from "@/lib/services/inventoryService";
import { shopService } from "@/lib/services/shopService";
import { bindActiveShopToUser } from "@/lib/shop-session";
import type {
  ApiIngredient,
  ApiInventory,
  ApiInventoryItem,
} from "@/types";
import type { Shop } from "@/types/shop";
import { toast } from "sonner";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type InventoryRow = {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  theorical_quantity: number;
  adjusted_quantity: number | null;
  actual_quantity: number;
  status: StockStatus;
  updated_at: string;
} & Record<string, unknown>;

function getStockStatus(
  actual: number | null | undefined,
  threshold: number | null,
): StockStatus {
  const qty = actual ?? 0;
  if (qty === 0) return "out_of_stock";
  if (threshold != null && qty <= threshold) return "low_stock";
  return "in_stock";
}

const STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "Đủ hàng",
  low_stock: "Sắp hết",
  out_of_stock: "Hết hàng",
};

const STATUS_VARIANT: Record<
  StockStatus,
  "success" | "warning" | "destructive"
> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
};

function toRows(
  items: ApiInventoryItem[],
  threshold: number | null,
): InventoryRow[] {
  return items.map((item) => ({
    id: item.id,
    ingredient_id: item.ingredient_id,
    ingredient_name: item.ingredient.name,
    unit: item.ingredient.unit ?? "—",
    theorical_quantity: item.theorical_quantity,
    adjusted_quantity: item.adjusted_quantity,
    actual_quantity: item.actual_quantity ?? 0,
    status: getStockStatus(item.actual_quantity, threshold),
    updated_at: item.updated_at,
  }));
}

export default function InventoryPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <InventoryContent />
    </AccessGuard>
  );
}

function InventoryContent() {
  const { role } = useAuth();
  if (role === "admin") return <AdminInventoryNotice />;
  return <ShopOwnerInventoryView />;
}

function AdminInventoryNotice() {
  return (
    <div>
      <Header />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tồn kho</CardTitle>
            <CardDescription>
              API tồn kho trên backend chỉ dành cho vai trò Shop Owner (quản lý
              theo từng cửa hàng). Đăng nhập bằng tài khoản chủ shop để nhập /
              xuất kho và xem cảnh báo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function ShopOwnerInventoryView() {
  const { user, accessToken, setSession } = useAuth();

  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopsLoading, setShopsLoading] = useState(true);

  const [inventory, setInventory] = useState<ApiInventory | null>(null);
  const [alerts, setAlerts] = useState<ApiInventoryItem[]>([]);
  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureForm, setConfigureForm] = useState({
    minimum_threshold: "",
    reorder_quantity: "",
  });
  const [configureSaving, setConfigureSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ingredient_id: "", quantity: "" });
  const [addSaving, setAddSaving] = useState(false);

  const [reduceOpen, setReduceOpen] = useState(false);
  const [reduceTarget, setReduceTarget] = useState<InventoryRow | null>(null);
  const [reduceQty, setReduceQty] = useState("");
  const [reduceSaving, setReduceSaving] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryRow | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    actual_quantity: "",
    theorical_quantity: "",
    adjusted_quantity: "",
  });
  const [adjustSaving, setAdjustSaving] = useState(false);

  const activeShop = shops.find((s) => s.id === shopId) ?? null;
  const threshold = inventory?.minimum_threshold ?? null;

  const loadShops = useCallback(async () => {
    if (!user) return;
    setShopsLoading(true);
    try {
      const list = await shopService.getMine();
      const forTenant = list.filter((s) => s.tenant_id === user.tenant_id);
      setShops(forTenant);
      const primary = pickPrimaryShop(forTenant, user);
      setShopId(primary?.id ?? null);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không tải được cửa hàng",
      );
    } finally {
      setShopsLoading(false);
    }
  }, [user]);

  const loadInventoryData = useCallback(async () => {
    if (shopId == null) return;
    setLoading(true);
    setError(null);
    try {
      const [inv, alertList, ingredientList] = await Promise.all([
        inventoryService.getInventory(shopId),
        inventoryService.getAlerts(shopId),
        ingredientService.getAll(),
      ]);
      setInventory(inv);
      setAlerts(alertList);
      setIngredients(ingredientList.filter((i) => i.is_active));
      setConfigureForm({
        minimum_threshold:
          inv.minimum_threshold != null ? String(inv.minimum_threshold) : "",
        reorder_quantity:
          inv.reorder_quantity != null ? String(inv.reorder_quantity) : "",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không tải được tồn kho",
      );
      setInventory(null);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void loadShops();
  }, [loadShops]);

  useEffect(() => {
    void loadInventoryData();
  }, [loadInventoryData]);

  function handleShopChange(nextId: number) {
    if (!user) return;
    setShopId(nextId);
    setActiveShopId(user.tenant_id, nextId);
    const shop = shops.find((s) => s.id === nextId);
    if (shop && accessToken) {
      setSession(accessToken, bindActiveShopToUser(user, shop));
    }
  }

  async function handleConfigure() {
    if (shopId == null) return;
    setConfigureSaving(true);
    try {
      const payload: {
        minimum_threshold?: number;
        reorder_quantity?: number;
      } = {};
      if (configureForm.minimum_threshold.trim() !== "") {
        payload.minimum_threshold = Number(configureForm.minimum_threshold);
      }
      if (configureForm.reorder_quantity.trim() !== "") {
        payload.reorder_quantity = Number(configureForm.reorder_quantity);
      }
      await inventoryService.configure(shopId, payload);
      toast.success("Đã cập nhật cấu hình tồn kho");
      setConfigureOpen(false);
      await loadInventoryData();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật cấu hình thất bại",
      );
    } finally {
      setConfigureSaving(false);
    }
  }

  async function handleAddStock() {
    if (shopId == null) return;
    const ingredientId = Number(addForm.ingredient_id);
    const quantity = Number(addForm.quantity);
    if (!ingredientId || !Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Chọn nguyên liệu và nhập số lượng hợp lệ");
      return;
    }
    setAddSaving(true);
    try {
      await inventoryService.addStock(shopId, {
        ingredient_id: ingredientId,
        quantity,
      });
      toast.success("Đã nhập kho");
      setAddOpen(false);
      setAddForm({ ingredient_id: "", quantity: "" });
      await loadInventoryData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Nhập kho thất bại");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleReduceStock() {
    if (shopId == null || !reduceTarget) return;
    const quantity = Number(reduceQty);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Số lượng xuất không hợp lệ");
      return;
    }
    setReduceSaving(true);
    try {
      await inventoryService.reduceStock(shopId, {
        ingredient_id: reduceTarget.ingredient_id,
        quantity,
      });
      toast.success("Đã xuất kho");
      setReduceOpen(false);
      setReduceTarget(null);
      setReduceQty("");
      await loadInventoryData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Xuất kho thất bại");
    } finally {
      setReduceSaving(false);
    }
  }

  async function handleAdjust() {
    if (shopId == null || !adjustTarget) return;
    const payload: {
      ingredient_id: number;
      actual_quantity?: number;
      theorical_quantity?: number;
      adjusted_quantity?: number;
    } = { ingredient_id: adjustTarget.ingredient_id };

    if (adjustForm.actual_quantity.trim() !== "") {
      payload.actual_quantity = Number(adjustForm.actual_quantity);
    }
    if (adjustForm.theorical_quantity.trim() !== "") {
      payload.theorical_quantity = Number(adjustForm.theorical_quantity);
    }
    if (adjustForm.adjusted_quantity.trim() !== "") {
      payload.adjusted_quantity = Number(adjustForm.adjusted_quantity);
    }

    if (
      payload.actual_quantity === undefined &&
      payload.theorical_quantity === undefined &&
      payload.adjusted_quantity === undefined
    ) {
      toast.error("Nhập ít nhất một giá trị số lượng");
      return;
    }

    setAdjustSaving(true);
    try {
      await inventoryService.updateQuantities(shopId, payload);
      toast.success("Đã cập nhật số lượng");
      setAdjustOpen(false);
      setAdjustTarget(null);
      await loadInventoryData();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật số lượng thất bại",
      );
    } finally {
      setAdjustSaving(false);
    }
  }

  function openReduce(row: InventoryRow) {
    setReduceTarget(row);
    setReduceQty("");
    setReduceOpen(true);
  }

  function openAdjust(row: InventoryRow) {
    setAdjustTarget(row);
    setAdjustForm({
      actual_quantity: String(row.actual_quantity),
      theorical_quantity: String(row.theorical_quantity),
      adjusted_quantity:
        row.adjusted_quantity != null ? String(row.adjusted_quantity) : "",
    });
    setAdjustOpen(true);
  }

  const rows = useMemo(
    () => toRows(inventory?.inventory_items ?? [], threshold),
    [inventory, threshold],
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (r) =>
        r.ingredient_name.toLowerCase().includes(keyword) ||
        r.unit.toLowerCase().includes(keyword) ||
        STATUS_LABEL[r.status].toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  const inStock = rows.filter((r) => r.status === "in_stock").length;
  const lowStock = rows.filter((r) => r.status === "low_stock").length;
  const outOfStock = rows.filter((r) => r.status === "out_of_stock").length;

  const columns = useMemo<Column<InventoryRow>[]>(
    () => [
      {
        key: "ingredient_name",
        label: "Nguyên liệu",
        render: (row) => (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.ingredient_name}
          </div>
        ),
      },
      { key: "unit", label: "Đơn vị" },
      {
        key: "actual_quantity",
        label: "Tồn thực tế",
        render: (row) => (
          <span className="font-semibold">{row.actual_quantity}</span>
        ),
      },
      {
        key: "theorical_quantity",
        label: "Tồn lý thuyết",
        render: (row) => <span>{row.theorical_quantity}</span>,
      },
      {
        key: "status",
        label: "Trạng thái",
        render: (row) => (
          <Badge variant={STATUS_VARIANT[row.status]}>
            {STATUS_LABEL[row.status]}
          </Badge>
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
              className="h-8 gap-1 text-xs"
              onClick={() => openAdjust(row)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Chỉnh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-orange-600 hover:text-orange-700"
              disabled={row.actual_quantity <= 0}
              onClick={() => openReduce(row)}
            >
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Xuất
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (shopsLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Đang tải cửa hàng…</p>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div>
        <Header />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Chưa có cửa hàng</CardTitle>
              <CardDescription>
                Tạo cửa hàng trước khi quản lý tồn kho nguyên liệu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/shop">Đi tới Cửa hàng</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tồn kho"
          description={
            activeShop
              ? `Quản lý tồn nguyên liệu tại ${activeShop.shop_name}`
              : "Quản lý tồn nguyên liệu theo cửa hàng"
          }
          role="shop_owner"
          breadcrumbs={[{ label: "Shop Owner" }, { label: "Tồn kho" }]}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void loadInventoryData()}
                disabled={loading || shopId == null}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setConfigureOpen(true)}
                disabled={shopId == null}
              >
                <Settings2 className="h-4 w-4" />
                Cấu hình
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setAddOpen(true)}
                disabled={shopId == null || ingredients.length === 0}
              >
                <ArrowUpCircle className="h-4 w-4" />
                Nhập kho
              </Button>
            </div>
          }
        />

        {shops.length > 1 && (
          <div className="max-w-md">
            <Label htmlFor="shop_select">Cửa hàng</Label>
            <select
              id="shop_select"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={shopId ?? ""}
              onChange={(e) => handleShopChange(Number(e.target.value))}
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shop_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {ingredients.length === 0 && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Chưa có nguyên liệu.{" "}
            <Link href="/ingredients" className="font-medium underline">
              Thêm nguyên liệu
            </Link>{" "}
            trước khi nhập kho.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox
            title="Dòng tồn kho"
            value={rows.length}
            icon={<Warehouse className="h-4 w-4" />}
          />
          <StatBox
            title="Đủ hàng"
            value={inStock}
            icon={<Package className="h-4 w-4" />}
            tone="green"
          />
          <StatBox
            title="Sắp hết"
            value={lowStock}
            icon={<AlertTriangle className="h-4 w-4" />}
            tone="amber"
          />
          
        </div>

        {threshold != null && (
          <p className="text-sm text-muted-foreground">
            Ngưỡng cảnh báo: ≤ {threshold}
            {inventory?.reorder_quantity != null &&
              ` · Gợi ý đặt lại: ${inventory.reorder_quantity}`}
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs"
              onClick={() => void loadInventoryData()}
            >
              Thử lại
            </Button>
          </div>
        )}

        {alerts.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Cảnh báo sắp hết ({alerts.length})
              </CardTitle>
              <CardDescription>
                Nguyên liệu có tồn thực tế ≤ ngưỡng{" "}
                {threshold ?? "—"} (cần cấu hình ngưỡng để bật cảnh báo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {alerts.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between rounded-md border border-amber-100 bg-amber-50/50 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-950/20"
                  >
                    <span className="font-medium">{item.ingredient.name}</span>
                    <span className="text-amber-800 dark:text-amber-300">
                      {item.actual_quantity ?? 0}{" "}
                      {item.ingredient.unit ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Chi tiết tồn kho</CardTitle>
            <CardDescription>
              Mỗi dòng là một nguyên liệu đã từng nhập kho tại cửa hàng này.
            </CardDescription>
            <div className="max-w-md pt-2">
              <Input
                placeholder="Tìm theo tên nguyên liệu, đơn vị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải tồn kho...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRows}
                emptyMessage={
                  search
                    ? "Không tìm thấy dòng tồn kho phù hợp."
                    : "Chưa có tồn kho. Dùng «Nhập kho» để thêm nguyên liệu đầu tiên."
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configure */}
      <Dialog open={configureOpen} onOpenChange={setConfigureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cấu hình tồn kho</DialogTitle>
            <DialogDescription>
              Ngưỡng cảnh báo áp dụng cho mọi nguyên liệu trong cửa hàng này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="minimum_threshold">Ngưỡng cảnh báo (minimum)</Label>
              <Input
                id="minimum_threshold"
                type="number"
                min={0}
                value={configureForm.minimum_threshold}
                onChange={(e) =>
                  setConfigureForm((p) => ({
                    ...p,
                    minimum_threshold: e.target.value,
                  }))
                }
                placeholder="Ví dụ: 5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder_quantity">Số lượng gợi ý đặt lại</Label>
              <Input
                id="reorder_quantity"
                type="number"
                min={0}
                value={configureForm.reorder_quantity}
                onChange={(e) =>
                  setConfigureForm((p) => ({
                    ...p,
                    reorder_quantity: e.target.value,
                  }))
                }
                placeholder="Ví dụ: 20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigureOpen(false)}
              disabled={configureSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleConfigure()}
              disabled={configureSaving}
            >
              {configureSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add stock */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
            <DialogDescription>
              Tăng tồn lý thuyết và tồn thực tế cho nguyên liệu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add_ingredient">Nguyên liệu</Label>
              <select
                id="add_ingredient"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={addForm.ingredient_id}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, ingredient_id: e.target.value }))
                }
              >
                <option value="">Chọn nguyên liệu</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                    {ing.unit ? ` (${ing.unit})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add_quantity">Số lượng nhập</Label>
              <Input
                id="add_quantity"
                type="number"
                min={0.0001}
                step="any"
                value={addForm.quantity}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => void handleAddStock()}
              disabled={addSaving}
            >
              {addSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nhập kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reduce stock */}
      <Dialog open={reduceOpen} onOpenChange={setReduceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xuất kho</DialogTitle>
            <DialogDescription>
              {reduceTarget
                ? `Giảm tồn: ${reduceTarget.ingredient_name} (hiện có ${reduceTarget.actual_quantity} ${reduceTarget.unit})`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="reduce_qty">Số lượng xuất</Label>
            <Input
              id="reduce_qty"
              type="number"
              min={0.0001}
              step="any"
              value={reduceQty}
              onChange={(e) => setReduceQty(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReduceOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => void handleReduceStock()}
              disabled={reduceSaving}
            >
              {reduceSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xuất kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust quantities */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh số lượng thủ công</DialogTitle>
            <DialogDescription>
              {adjustTarget ? adjustTarget.ingredient_name : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="adj_actual">Tồn thực tế</Label>
              <Input
                id="adj_actual"
                type="number"
                min={0}
                value={adjustForm.actual_quantity}
                onChange={(e) =>
                  setAdjustForm((p) => ({
                    ...p,
                    actual_quantity: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adj_theorical">Tồn lý thuyết</Label>
              <Input
                id="adj_theorical"
                type="number"
                min={0}
                value={adjustForm.theorical_quantity}
                onChange={(e) =>
                  setAdjustForm((p) => ({
                    ...p,
                    theorical_quantity: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adj_adjusted">Điều chỉnh (adjusted)</Label>
              <Input
                id="adj_adjusted"
                type="number"
                min={0}
                value={adjustForm.adjusted_quantity}
                onChange={(e) =>
                  setAdjustForm((p) => ({
                    ...p,
                    adjusted_quantity: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void handleAdjust()} disabled={adjustSaving}>
              {adjustSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-600 dark:text-green-400"
      : tone === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "red"
          ? "text-red-600 dark:text-red-400"
          : "text-gray-600 dark:text-gray-400";

  return (
    <div className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-gray-500">
        {title}
        <span className={toneClass}>{icon}</span>
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}
