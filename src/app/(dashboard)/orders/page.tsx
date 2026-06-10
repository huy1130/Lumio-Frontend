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
interface POSProduct { id: string; name: string; price: number; category: string; unit: string; emoji: string; description: string; emojiBg: string; }

interface CartItem { product: POSProduct; qty: number }

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success", processing: "warning", pending: "secondary", cancelled: "destructive",
};

const QUICK_CASH_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

function StaffOrdersView() {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!shopId) return;
    Promise.all([
      productService.getAll(),
      orderService.getAll(shopId).catch(() => []),
      customerService.getAll().catch(() => [])
    ]).then(([prodRes, ordRes, custRes]) => {
      setProducts(prodRes.filter((p) => p.is_active !== false));
      setRecentOrders(ordRes);
      setCustomers(custRes);
    }).finally(() => setLoading(false));
  }, [shopId]);

  const posProducts: POSProduct[] = useMemo(() => {
    return products.map(p => ({
      id: String(p.id),
      name: p.product_name,
      price: Number(p.unit_price) || 0,
      category: p.category?.category_name || "Uncategorized",
      unit: p.measure_unit || "Item",
      emoji: "📦",
      description: p.description || "",
      emojiBg: "bg-gray-100"
    }));
  }, [products]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(posProducts.map((p) => p.category)))], [posProducts]);

  const visibleProducts = useMemo(() =>
    posProducts.filter((p) => {
      const catOk = activeCategory === "All" || p.category === activeCategory;
      const textOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return catOk && textOk;
    }), [posProducts, search, activeCategory]);

  const addToCart = (product: POSProduct) =>
    setCart((prev) => {
      const hit = prev.find((c) => c.product.id === product.id);
      if (hit) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((c) => c.product.id === id ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0));
  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.product.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const discount = 0; // Or calculate discount if applicable
  const tax = subtotal * 0.08;
  const total = subtotal - discount + tax;
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const processCheckout = async () => {
    if (!shopId || cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        shift_id: 1, // Defaulting to 1 for MVP as it's required by backend. In real world, fetch active shift.
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
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Đơn hàng gần đây ({recentOrders.length})</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thời gian</TableHead>
                    <TableHead>Ghi chú / Thanh toán</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                        Chưa có đơn hàng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                          selectedOrder?.id === order.id ? "bg-orange-50 dark:bg-orange-900/20 border-l-2 border-l-orange-500" : ""
                        )}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <TableCell className="font-mono font-semibold text-sm">#{order.id}</TableCell>
                        <TableCell>{order.customer?.full_name || "Khách lẻ"}</TableCell>
                        <TableCell className="font-semibold text-orange-600">{formatCurrency(Number(order.grand_total))}</TableCell>
                        <TableCell><Badge variant={STATUS_VARIANT[order.order_status?.toLowerCase()] || "secondary"} className="capitalize">{order.order_status}</Badge></TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <p>{order.notes}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {order.order_status === "PENDING" && (
                              <>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-2" onClick={() => setCancelOrderId(order.id)}>
                                  Huỷ
                                </Button>
                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 h-7 px-2" onClick={() => handleCheckoutExisting(order.id)}>
                                  <CheckCircle className="h-3 w-3 mr-1" /> Hoàn thành
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Khách hàng</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {selectedOrder.customer?.full_name || "Khách lẻ (Walk-in)"}
                  {selectedOrder.customer?.phone && <span className="block text-xs font-normal text-gray-500 mt-0.5">{selectedOrder.customer.phone}</span>}
                </p>
                <div className="grid grid-cols-2 gap-4">
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
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Current Order</h2>
                {totalQty > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalQty} item{totalQty !== 1 ? "s" : ""}</p>}
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
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No items yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click a product card to add it</p>
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
                    <span>Subtotal</span><span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount (5%)</span><span className="font-medium">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sales tax (8%)</span><span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-xl font-extrabold text-orange-500">{formatCurrency(total)}</span>
                </div>

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
                        type="number" 
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="text-lg font-medium h-10 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CASH_AMOUNTS.map((amt) => (
                        <Button 
                          key={amt} 
                          variant="outline" 
                          size="sm"
                          className="flex-1 min-w-[30%] text-xs border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                          onClick={() => {
                            const current = parseFloat(cashReceived) || 0;
                            setCashReceived((current + amt).toString());
                          }}
                        >
                          +{formatCurrency(amt).replace(/\.00$/, '').replace(/,00$/, '')}
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
                         <div className={`p-3 rounded-lg border flex justify-between items-center transition-colors duration-300 ${
                           isSufficient 
                             ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50" 
                             : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50"
                         }`}>
                           <span className={`text-sm font-medium ${
                             isSufficient ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
                           }`}>
                             {isSufficient ? "Tiền thối lại" : "Khách đưa thiếu"}
                           </span>
                           <span className={`text-lg font-bold tracking-tight ${
                             isSufficient ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
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
                  Clear order
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
  return (
    <div onClick={onAdd} className={cn("group relative flex flex-col rounded-2xl bg-white dark:bg-gray-800 border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      inCart > 0 ? "border-orange-300 dark:border-orange-600 ring-1 ring-orange-200 dark:ring-orange-900" : "border-gray-200 dark:border-gray-700")}>
      <div className={cn("relative flex items-center justify-center rounded-t-2xl h-32 text-5xl select-none bg-gray-100 dark:bg-gray-700")}>
        📦
        {inCart > 0 && (
          <span className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{inCart}</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-md text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{product.category}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">{product.name}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-sm font-extrabold text-orange-500">{formatCurrency(product.price)}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">/ {product.unit}</span>
        </div>
      </div>
    </div>
  );
}

function POSCartRow({ product, qty, onIncrease, onDecrease, onRemove }: { product: POSProduct; qty: number; onIncrease: () => void; onDecrease: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 group transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl select-none bg-gray-100 dark:bg-gray-700">📦</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
        <p className="text-xs font-bold text-orange-500 mt-0.5">{formatCurrency(product.price)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onDecrease} className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors">
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-xs font-bold text-gray-800 dark:text-gray-200 tabular-nums">{qty}</span>
        <button onClick={onIncrease} className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 ml-1">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
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
