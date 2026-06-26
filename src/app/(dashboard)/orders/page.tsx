"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Eye, Download, ShoppingCart, DollarSign, Clock, CheckCircle,
  Search, Filter, Plus, Minus, Trash2, Settings, Loader2,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Order, ApiProduct } from "@/types";
import { productService } from "@/lib/services/productService";
import { orderService, type ApiOrder } from "@/lib/services/orderService";
import { customerService, type ApiCustomer } from "@/lib/services/customerService";
import { shiftService, type ApiShift } from "@/lib/services/shiftService";
import { inventoryService } from "@/lib/services/inventoryService";
import type { ApiInventory } from "@/types";

export default function OrdersPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner", "inventory_staff", "cashier"]}>
      <OrdersContent />
    </AccessGuard>
  );
}

function OrdersContent() {
  const { role } = useAuth();
  if (role === "inventory_staff" || role === "cashier" || role === "shop_owner") return <StaffOrdersView />;
  return <AdminOrdersView />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN VIEW  —  read-only order table
// ─────────────────────────────────────────────────────────────────────────────
const orderStatusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success", processing: "warning", pending: "secondary", cancelled: "destructive",
};
const paymentVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  paid: "success", unpaid: "warning", refunded: "secondary",
};

function AdminOrdersView() {
  const orders: Order[] = [];

  const total = orders.reduce((s, o) => s + o.total, 0);
  const completed = orders.filter((o) => o.status === "completed").length;
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Orders" value={orders.length} icon={<ShoppingCart className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
          <StatsCard title="Total Revenue" value={formatCurrency(total)} icon={<DollarSign className="h-4 w-4" />} iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" />
          <StatsCard title="Pending" value={pending} icon={<Clock className="h-4 w-4" />} iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Read-only view of all system orders</CardDescription>
            </div>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
                  <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead>
                  <TableHead>Method</TableHead><TableHead>Created By</TableHead><TableHead>Date</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-muted-foreground text-sm">
                      No orders yet. Orders will appear here once data is connected.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{order.items.length} item(s)</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant[order.status]} className="capitalize">{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentVariant[order.paymentStatus]} className="capitalize">{order.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{order.paymentMethod ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{order.createdBy}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// STAFF VIEW  —  POS cart interface (products loaded from API later)
// ─────────────────────────────────────────────────────────────────────────────
interface POSProduct { id: string; name: string; price: number; category: string; unit: string; emoji: string; description: string; emojiBg: string; isOutOfStock?: boolean; maxSellableQty?: number; }

interface CartItem { product: POSProduct; qty: number }

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success", processing: "warning", pending: "secondary", cancelled: "destructive",
};

const QUICK_CASH_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const getLocalISODate = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function StaffOrdersView() {
  const { user, role } = useAuth();
  const shopId = user?.shop_id;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"menu" | "history">("menu");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [filterDateStr, setFilterDateStr] = useState<string>(getLocalISODate(new Date()));
  const [activeShift, setActiveShift] = useState<ApiShift | null>(null);
  const [shopInventory, setShopInventory] = useState<ApiInventory | null>(null);

  useEffect(() => {
    if (!shopId) return;
    const promises: Promise<any>[] = [
      productService.getAll(),
      orderService.getAll(shopId).catch(() => []),
      customerService.getAll().catch(() => []),
      shiftService.getShiftsByShop(shopId).catch(() => [])
    ];

    if (role === "shop_owner") {
      promises.push(inventoryService.getInventory(shopId).catch(() => null));
    }

    Promise.all(promises).then((res) => {
      const [prodRes, ordRes, custRes, shiftRes, invRes] = res;
      setProducts(prodRes.filter((p: any) => p.is_active !== false));
      setRecentOrders(ordRes);
      setCustomers(custRes);
      const active = shiftRes.find((s: any) => s.shift_status === 'OPEN');
      setActiveShift(active || null);
      if (invRes) setShopInventory(invRes);
    }).finally(() => setLoading(false));
  }, [shopId, role]);

  const posProducts: POSProduct[] = useMemo(() => {
    return products.map(p => {
      let isOutOfStock = !!(p as any).is_out_of_stock;
      let maxSellableQty = p.max_sellable_quantity;

      if (role === "shop_owner" && shopInventory) {
        let maxSellable = p.ingredient_products?.length ? Number.MAX_SAFE_INTEGER : 9999;
        const inventoryMap = new Map((shopInventory.inventory_items || []).map((i: any) => [i.ingredient_id, i]));

        for (const ip of (p.ingredient_products || [])) {
          const invItem = inventoryMap.get(ip.ingredient_id);
          const qty = invItem?.theorical_quantity || 0;
          const threshold = invItem?.minimum_threshold || 0;
          const available = qty - threshold;
          const reqQty = Number(ip.quantity_required);

          if (reqQty > 0) {
            const maxWithThisIngredient = Math.max(0, Math.floor(available / reqQty));
            if (maxWithThisIngredient < maxSellable) {
              maxSellable = maxWithThisIngredient;
            }
          }
        }

        if (p.ingredient_products?.length) {
          isOutOfStock = maxSellable <= 0;
          maxSellableQty = maxSellable;
        }
      }

      return {
        id: String(p.id),
        name: p.product_name,
        price: Number(p.unit_price) || 0,
        category: p.category?.category_name || "Uncategorized",
        unit: p.measure_unit || "Item",
        emoji: "📦",
        description: p.description || "",
        emojiBg: "bg-gray-100",
        isOutOfStock,
        maxSellableQty,
      };
    });
  }, [products, role, shopInventory]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(posProducts.map((p) => p.category)))], [posProducts]);

  const visibleProducts = useMemo(() =>
    posProducts.filter((p) => {
      const catOk = activeCategory === "All" || p.category === activeCategory;
      const textOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return catOk && textOk;
    }), [posProducts, search, activeCategory]);

  const filteredRecentOrders = useMemo(() => {
    if (!filterDateStr) return recentOrders;
    return recentOrders.filter(order => {
      if (!order.created_at) return false;
      return getLocalISODate(new Date(order.created_at)) === filterDateStr;
    });
  }, [recentOrders, filterDateStr]);

  const addToCart = (product: POSProduct) =>
    setCart((prev) => {
      const hit = prev.find((c) => c.product.id === product.id);
      if (hit) {
        if (product.maxSellableQty !== undefined && hit.qty >= product.maxSellableQty) {
          toast.error(`Chỉ còn đủ nguyên liệu cho ${product.maxSellableQty} sản phẩm`);
          return prev;
        }
        return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      if (product.maxSellableQty !== undefined && product.maxSellableQty < 1) return prev;
      return [...prev, { product, qty: 1 }];
    });

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((c) => {
      if (c.product.id === id) {
        const newQty = c.qty + delta;
        if (delta > 0 && c.product.maxSellableQty !== undefined && newQty > c.product.maxSellableQty) {
          toast.error(`Chỉ còn đủ nguyên liệu cho ${c.product.maxSellableQty} sản phẩm`);
          return { ...c, qty: c.product.maxSellableQty };
        }
        return { ...c, qty: newQty };
      }
      return c;
    }).filter((c) => c.qty > 0));
  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.product.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const discount = 0;
  const tax = 0;
  const total = subtotal;
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const refreshData = () => {
    if (!shopId) return;
    productService.getAll().then(prods => setProducts(prods || [])).catch(() => {});
    if (role === "shop_owner") {
      inventoryService.getInventory(shopId).then(inv => {
        if (inv) setShopInventory(inv);
      }).catch(() => {});
    }
  };

  const processCheckout = async () => {
    if (!shopId || cart.length === 0) return;
    if (!activeShift) {
      toast.error("Vui lòng mở ca làm việc trước khi tạo đơn hàng (Chưa có ca làm việc nào đang mở).");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        shift_id: activeShift.id,
        customer_id: selectedCustomerId || undefined,
        notes: `Thanh toán: ${paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}`,
        items: cart.map(c => ({
          product_id: Number(c.product.id),
          quantity: c.qty
        }))
      };

      // Khách hàng thanh toán xong -> Tạo đơn hàng (Trạng thái: PENDING để pha chế)
      const newOrder = await orderService.create(shopId, payload);
      toast.success("Tạo đơn hàng thành công (Đang chờ xử lý)!");
      setRecentOrders(prev => [newOrder, ...prev]);
      clearCart();
      setCashReceived("");
      setShowTransferConfirm(false);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tạo đơn hàng";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutClick = () => {
    if (paymentMethod === "TRANSFER") {
      setShowTransferConfirm(true);
    } else {
      processCheckout();
    }
  };

  const handleCheckoutExisting = async (orderId: number) => {
    if (!shopId) return;
    try {
      const res = await orderService.checkout(shopId, orderId);
      const updatedOrder = res; // already unwrapped by api client
      toast.success("Đã hoàn thành đơn hàng!");
      setRecentOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi hoàn thành đơn hàng");
    }
  };

  const handleCancelExisting = async (orderId: number) => {
    if (!shopId) return;
    setIsSubmitting(true);
    try {
      const res = await orderService.update(shopId, orderId, { order_status: "CANCELLED" });
      const updatedOrder = res; // already unwrapped by api client
      toast.success("Đã huỷ đơn hàng!");
      setRecentOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      refreshData();
      setCancelOrderId(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi huỷ đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 bg-gray-50 dark:bg-gray-950">

      {/* LEFT — products pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-4 bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bán hàng (POS)</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Tạo đơn hàng mới hoặc quản lý lịch sử</p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab("menu"); setSelectedOrder(null); }}
                className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-all", activeTab === "menu" ? "bg-white dark:bg-gray-900 text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
              >
                Tạo đơn hàng
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-all", activeTab === "history" ? "bg-white dark:bg-gray-900 text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
              >
                Lịch sử đơn
              </button>
            </div>
          </div>
          {activeTab === "menu" && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-200 dark:shadow-orange-900/40"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600")}>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 space-y-6">
          {activeTab === "menu" ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {activeCategory === "All" ? "Tất cả sản phẩm" : activeCategory}
                  <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">({visibleProducts.length})</span>
                </p>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Tìm món..." className="pl-9 h-9 text-sm bg-white dark:bg-gray-800"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Đang tải sản phẩm...</p>
                </div>
              ) : visibleProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {visibleProducts.map((product) => (
                    <POSProductCard key={product.id} product={product}
                      inCart={cart.find((c) => c.product.id === product.id)?.qty ?? 0}
                      onAdd={() => addToCart(product)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy sản phẩm nào</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Hãy thử thay đổi từ khoá tìm kiếm.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 max-w-5xl mx-auto pb-10">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">Đơn hàng <span className="text-gray-400 font-normal text-sm ml-1">({filteredRecentOrders.length})</span></h3>
                <input
                  type="date"
                  value={filterDateStr}
                  onChange={(e) => setFilterDateStr(e.target.value)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredRecentOrders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                    Chưa có đơn hàng nào trong ngày này.
                  </div>
                ) : (
                  filteredRecentOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800/50",
                        selectedOrder?.id === order.id
                          ? "border-orange-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-orange-900/20 ring-1 ring-orange-500/50"
                          : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 flex-1">
                          <div className={cn("flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            order.order_status === "PENDING" ? "bg-orange-50/80 text-orange-600 dark:bg-orange-900/30" :
                              order.order_status === "COMPLETED" ? "bg-green-50/80 text-green-600 dark:bg-green-900/30" : "bg-gray-50 text-gray-500 dark:bg-gray-800"
                          )}>
                            {order.order_status === "PENDING" ? <Clock className="w-5 h-5" /> :
                              order.order_status === "COMPLETED" ? <CheckCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">#{order.id}</span>
                              <Badge variant={STATUS_VARIANT[order.order_status?.toLowerCase()] || "secondary"} className="h-5 text-[10px] px-2 uppercase font-bold tracking-widest rounded-md">
                                {order.order_status}
                              </Badge>
                            </div>
                            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{order.customer?.full_name || "Khách lẻ"}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                              <span>{formatDate(order.created_at)}</span>
                            </span>
                            {order.notes && (
                              <span className="text-[13px] text-gray-400 dark:text-gray-500 line-clamp-1 italic">"{order.notes}"</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 justify-center">
                          <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                            {formatCurrency(Number(order.grand_total))}
                          </span>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {order.order_status === "PENDING" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 transition-colors" onClick={() => setCancelOrderId(order.id)}>
                                  Huỷ đơn
                                </Button>
                                <Button size="sm" className="h-8 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm rounded-lg px-4 transition-colors" onClick={() => handleCheckoutExisting(order.id)}>
                                  Hoàn thành
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — cart panel or order details */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {selectedOrder ? (
          <div className="flex flex-col h-full">
            <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Chi tiết đơn #{selectedOrder.id}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Khách hàng</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedOrder.customer?.full_name || "Khách lẻ (Walk-in)"}
                      {selectedOrder.customer?.phone && <span className="block text-xs font-normal text-gray-500 mt-0.5">{selectedOrder.customer.phone}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Người tạo đơn</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedOrder.cashier?.full_name || selectedOrder.cashier?.email || "Không rõ"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trạng thái</p>
                    <Badge variant={STATUS_VARIANT[selectedOrder.order_status?.toLowerCase() || ""] || "secondary"} className="capitalize">
                      {selectedOrder.order_status}
                    </Badge>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ghi chú / Thanh toán</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Sản phẩm ({selectedOrder.order_items?.length || 0})</h4>
                <div className="space-y-4">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product?.product_name || `Sản phẩm #${item.product_id}`}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.quantity} x {formatCurrency(Number(item.unit_price))}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.quantity * Number(item.unit_price))}</p>
                    </div>
                  ))}
                  {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">Không có sản phẩm nào</p>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 pt-4 pb-6 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Tạm tính:</span>
                <span>{formatCurrency(Number(selectedOrder.subtotal_amount))}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg mt-1">
                <span className="text-gray-900 dark:text-gray-100">Tổng cộng:</span>
                <span className="text-orange-500">{formatCurrency(Number(selectedOrder.grand_total))}</span>
              </div>
              <Button onClick={() => setSelectedOrder(null)} className="w-full mt-4 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 h-12 rounded-xl font-semibold">
                Quay lại tạo đơn mới
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Đơn hàng hiện tại</h2>
                {totalQty > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalQty} sản phẩm</p>}
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="shrink-0 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <CustomerSearch
                customers={customers}
                selectedId={selectedCustomerId}
                onChange={setSelectedCustomerId}
                onCustomerCreated={(newCust) => setCustomers(prev => [...prev, newCust])}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 mt-3 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20 mb-4">
                    <ShoppingCart className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Chưa có sản phẩm</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Chọn sản phẩm từ danh sách bên trái để thêm</p>
                </div>
              ) : (
                cart.map(({ product, qty }) => (
                  <POSCartRow key={product.id} product={product} qty={qty}
                    onIncrease={() => updateQty(product.id, +1)}
                    onDecrease={() => updateQty(product.id, -1)}
                    onRemove={() => removeItem(product.id)} />
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 pt-4 pb-6 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tổng cộng</span><span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
                  </div>
                  {/* <div className="flex justify-between text-red-500">
                    <span>Discount (5%)</span><span className="font-medium">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sales tax (8%)</span><span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
                  </div> */}
                </div>
                <Separator />
                {/* <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-xl font-extrabold text-orange-500">{formatCurrency(total)}</span>
                </div> */}

                <div className="flex gap-2 pb-1">
                  <button
                    onClick={() => setPaymentMethod("CASH")}
                    className={cn("flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors", paymentMethod === "CASH" ? "bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700")}
                  >
                    Tiền mặt
                  </button>
                  <button
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={cn("flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors", paymentMethod === "TRANSFER" ? "bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700")}
                  >
                    Chuyển khoản
                  </button>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 py-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tiền khách đưa</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 p-0"
                          onClick={() => setCashReceived(total.toString())}
                        >
                          Khách đưa đủ
                        </Button>
                      </div>
                      <Input
                        placeholder="0"
                        type="text"
                        value={cashReceived ? new Intl.NumberFormat('vi-VN').format(Number(cashReceived.replace(/\D/g, ''))) : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          setCashReceived(rawValue);
                        }}
                        className="text-lg font-medium h-10 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CASH_AMOUNTS.map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[30%] text-xs font-semibold border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                          onClick={() => setCashReceived(amt.toString())}
                        >
                          {new Intl.NumberFormat('vi-VN').format(amt)}
                        </Button>
                      ))}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 min-w-[30%] text-xs"
                        onClick={() => setCashReceived("")}
                      >
                        Xóa
                      </Button>
                    </div>

                    {(() => {
                      const received = parseFloat(cashReceived) || 0;
                      if (received === 0 && cashReceived === "") return null;

                      const change = received - total;
                      const isSufficient = change >= 0;

                      return (
                        <div className={`p-3 rounded-lg border flex justify-between items-center transition-colors duration-300 ${isSufficient
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50"
                          : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50"
                          }`}>
                          <span className={`text-sm font-medium ${isSufficient ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                            {isSufficient ? "Tiền thối lại" : "Khách đưa thiếu"}
                          </span>
                          <span className={`text-lg font-bold tracking-tight ${isSufficient ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                            {isSufficient ? formatCurrency(change) : formatCurrency(Math.abs(change))}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <button
                  disabled={isSubmitting || (paymentMethod === "CASH" && (parseFloat(cashReceived) || 0) < total)}
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 text-sm transition-colors shadow-sm shadow-orange-200 dark:shadow-orange-900/30">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isSubmitting ? "Đang xử lý..." : "Thanh toán"}
                </button>
                <button onClick={clearCart} className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1">
                  Xóa đơn hàng
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      <Dialog open={showTransferConfirm} onOpenChange={(open) => !open && setShowTransferConfirm(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center bg-orange-100 text-orange-600 w-8 h-8 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                <DollarSign className="h-5 w-5" />
              </span>
              Xác nhận chuyển khoản
            </DialogTitle>
            <DialogDescription className="py-4 text-sm text-gray-600 dark:text-gray-300">
              Vui lòng kiểm tra ứng dụng ngân hàng để đảm bảo đã nhận được số tiền <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">{formatCurrency(total)}</span> từ khách hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowTransferConfirm(false)} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={processCheckout} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />} Tiếp tục & Hoàn thành
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelOrderId} onOpenChange={(open) => !open && setCancelOrderId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Xác nhận huỷ đơn
            </DialogTitle>
            <DialogDescription className="py-4 text-sm text-gray-600 dark:text-gray-300">
              Bạn có chắc chắn muốn huỷ đơn hàng <span className="font-bold">#{cancelOrderId}</span> này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCancelOrderId(null)} disabled={isSubmitting}>
              Quay lại
            </Button>
            <Button type="button" variant="destructive" onClick={() => cancelOrderId && handleCancelExisting(cancelOrderId)} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Xác nhận huỷ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function POSProductCard({ product, inCart, onAdd }: { product: POSProduct; inCart: number; onAdd: () => void }) {
  const isOutOfStock = product.isOutOfStock;
  const isMaxReached = product.maxSellableQty !== undefined && inCart >= product.maxSellableQty;

  return (
    <div
      onClick={() => { if (!isOutOfStock && !isMaxReached) onAdd(); else if (isMaxReached) toast.error(`Chỉ còn đủ nguyên liệu cho ${product.maxSellableQty} sản phẩm`) }}
      className={cn(
        "group relative flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white dark:bg-gray-800/50 border transition-all duration-300 min-h-[120px]",
        isOutOfStock
          ? "opacity-60 cursor-not-allowed border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 grayscale-[30%]"
          : (isMaxReached ? "cursor-not-allowed hover:border-orange-300 opacity-90" : "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-orange-300 dark:hover:border-orange-700"),
        inCart > 0 && !isOutOfStock ? "border-orange-500 dark:border-orange-500 ring-1 ring-orange-500" : (!isOutOfStock ? "border-gray-100 dark:border-gray-800" : "")
      )}
    >
      {isOutOfStock && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-[0.5px]">
          <Badge variant="destructive" className="shadow-sm border border-red-200 dark:border-red-800">Hết nguyên liệu</Badge>
        </div>
      )}

      {!isOutOfStock && product.maxSellableQty !== undefined && product.maxSellableQty < 9999 && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] px-1.5 py-0 font-bold shadow-sm">Còn {product.maxSellableQty}</Badge>
        </div>
      )}

      {inCart > 0 && !isOutOfStock && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm animate-in zoom-in duration-200 z-20">
          {inCart}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1.5">{product.category}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-2">{product.name}</p>

      <div className="flex items-baseline justify-center gap-1 mt-auto">
        <span className="text-base font-bold text-orange-600 dark:text-orange-400">{formatCurrency(product.price)}</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">/{product.unit}</span>
      </div>
    </div>
  );
}

function POSCartRow({ product, qty, onIncrease, onDecrease, onRemove }: { product: POSProduct; qty: number; onIncrease: () => void; onDecrease: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight pr-4">{product.name}</p>
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1 -mr-1 -mt-1 opacity-0 group-hover:opacity-100">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{formatCurrency(product.price)}</p>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 rounded-md p-0.5 border border-gray-200 dark:border-gray-700">
            <button onClick={onDecrease} className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all">
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{qty}</span>
            <button onClick={onIncrease} disabled={product.maxSellableQty !== undefined && qty >= product.maxSellableQty} className={cn("flex h-6 w-6 items-center justify-center rounded bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 transition-all", product.maxSellableQty !== undefined && qty >= product.maxSellableQty ? "opacity-50 cursor-not-allowed" : "text-gray-900 dark:text-gray-100 hover:border-orange-500 hover:text-orange-600")}>
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerSearch({
  customers,
  selectedId,
  onChange,
  onCustomerCreated
}: {
  customers: ApiCustomer[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
  onCustomerCreated: (c: ApiCustomer) => void;
}) {
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedId);

  const filtered = customers.filter(c =>
    c.phone.includes(search) || c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!search || !newName) return;
    setIsCreating(true);
    try {
      const newCust = await customerService.create({ phone: search, full_name: newName });
      onCustomerCreated(newCust);
      onChange(newCust.id);
      setSearch("");
      setNewName("");
      setShowDropdown(false);
      toast.success("Đã tạo khách hàng mới!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo khách hàng");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      {selectedCustomer ? (
        <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 p-2 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">{selectedCustomer.full_name}</p>
            <p className="text-xs text-orange-700 dark:text-orange-400">{selectedCustomer.phone}</p>
          </div>
          <button onClick={() => onChange(null)} className="flex h-6 w-6 items-center justify-center rounded-full text-orange-500 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nhập SĐT khách hàng..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="w-full text-sm pl-9 bg-gray-50 dark:bg-gray-800 rounded-lg"
            />
          </div>

          {showDropdown && search && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden">
              {filtered.length > 0 ? (
                <div className="p-1">
                  {filtered.map(c => (
                    <div
                      key={c.id}
                      className="p-2 hover:bg-orange-50 dark:hover:bg-gray-800 cursor-pointer rounded-lg transition-colors"
                      onClick={() => { onChange(c.id); setSearch(""); setShowDropdown(false); }}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Không tìm thấy khách. Tạo mới:</p>
                  <Input
                    placeholder="Nhập Tên khách hàng..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-9 text-sm mb-2 bg-white dark:bg-gray-900"
                  />
                  <Button
                    size="sm"
                    className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    onClick={handleCreate}
                    disabled={isCreating || !newName}
                  >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />} Thêm mới & Chọn
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Backdrop for closing dropdown */}
          {showDropdown && search && (
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          )}
        </div>
      )}
    </div>
  );
}
