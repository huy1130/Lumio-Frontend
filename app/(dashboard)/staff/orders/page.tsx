"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, ShoppingCart, Plus, Minus,
  Trash2, Settings, ChevronDown, ChevronUp,
  Clock, CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockProducts, mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Product } from "@/types";

// ─── POS-enriched product data ────────────────────────────────────────────────
interface POSProduct extends Product {
  emoji: string;
  description: string;
  emojiBg: string; // Tailwind class for the image-area bg
}

const POS_ENRICHED: Record<string, { emoji: string; description: string; emojiBg: string }> = {
  "1": { emoji: "☕", description: "Premium arabica espresso beans, 1 kg bag", emojiBg: "bg-amber-100 dark:bg-amber-900/40" },
  "2": { emoji: "🥛", description: "Fresh whole cow milk, 1 litre bottle",    emojiBg: "bg-sky-100 dark:bg-sky-900/40" },
  "3": { emoji: "🫐", description: "Freshly baked blueberry muffin, daily",   emojiBg: "bg-purple-100 dark:bg-purple-900/40" },
  "4": { emoji: "🍵", description: "Premium green tea bags, 20-count box",    emojiBg: "bg-green-100 dark:bg-green-900/40" },
  "5": { emoji: "🥐", description: "Buttery classic croissant, baked fresh",  emojiBg: "bg-orange-100 dark:bg-orange-900/40" },
  "6": { emoji: "🌾", description: "Plant-based oat milk, barista edition",   emojiBg: "bg-lime-100 dark:bg-lime-900/40" },
};

const posProducts: POSProduct[] = mockProducts.map((p) => ({
  ...p,
  ...(POS_ENRICHED[p.id] ?? { emoji: "📦", description: p.name, emojiBg: "bg-gray-100" }),
}));

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  All:       "🛍️",
  Beverages: "☕",
  Dairy:     "🥛",
  Bakery:    "🥐",
};

// ─── Order status ─────────────────────────────────────────────────────────────
const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  completed:  "success",
  processing: "warning",
  pending:    "secondary",
  cancelled:  "destructive",
};

// ─── Cart item type ───────────────────────────────────────────────────────────
interface CartItem { product: POSProduct; qty: number }

// ─────────────────────────────────────────────────────────────────────────────
export default function StaffOrdersPage() {
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [showRecentOrders, setShowRecentOrders] = useState(false);

  // ── Derived categories ──────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const unique = Array.from(new Set(posProducts.map((p) => p.category)));
    return ["All", ...unique];
  }, []);

  // ── Filtered product grid ───────────────────────────────────────────────────
  const visibleProducts = useMemo(() => {
    return posProducts.filter((p) => {
      const catOk  = activeCategory === "All" || p.category === activeCategory;
      const textOk = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return catOk && textOk;
    });
  }, [search, activeCategory]);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (product: POSProduct) =>
    setCart((prev) => {
      const hit = prev.find((c) => c.product.id === product.id);
      if (hit) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((c) => c.product.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((c) => c.product.id !== id));

  const clearCart = () => setCart([]);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const subtotal  = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const discount  = subtotal * 0.05;   // 5% promo discount
  const tax       = subtotal * 0.08;
  const total     = subtotal - discount + tax;
  const totalQty  = cart.reduce((s, c) => s + c.qty, 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 bg-gray-50 dark:bg-gray-950">

      {/* ════════════════════════════════════════════════════════════════════
          LEFT  –  Products pane
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 pt-6 pb-4 bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Welcome */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Welcome, Carol 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Discover whatever you need easily
              </p>
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search product..."
                  className="pl-9 rounded-xl bg-white dark:bg-gray-800"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Category tabs ─────────────────────────────────────────── */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const icon     = CATEGORY_ICONS[cat] ?? "📦";
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-200 dark:shadow-orange-900/40"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600"
                  )}
                >
                  <span>{icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable product grid + recent orders ───────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">

          {/* Section label */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {activeCategory === "All" ? "All Products" : activeCategory}
              <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">
                ({visibleProducts.length})
              </span>
            </p>
          </div>

          {/* Product grid – 3 cols */}
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={cart.find((c) => c.product.id === product.id)?.qty ?? 0}
                  onAdd={() => addToCart(product)}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} category={activeCategory} />
          )}

          {/* ── Recent Orders (collapsible) ────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setShowRecentOrders((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Recent Orders
                <Badge variant="secondary" className="text-xs">{mockOrders.length}</Badge>
              </span>
              {showRecentOrders
                ? <ChevronUp className="h-4 w-4 text-gray-400" />
                : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {showRecentOrders && (
              <div className="border-t border-gray-100 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-semibold text-sm">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[order.status]} className="capitalize">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT  –  Current Order panel
      ════════════════════════════════════════════════════════════════════ */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">

        {/* Panel header */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Current Order</h2>
            {totalQty > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalQty} item{totalQty !== 1 ? "s" : ""}</p>
            )}
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Cart items — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3">

          {cart.length === 0 ? (
            // Empty cart
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20 mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No items yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click a product card to add it</p>
            </div>
          ) : (
            cart.map(({ product, qty }) => (
              <CartRow
                key={product.id}
                product={product}
                qty={qty}
                onIncrease={() => updateQty(product.id, +1)}
                onDecrease={() => updateQty(product.id, -1)}
                onRemove={() => removeItem(product.id)}
              />
            ))
          )}
        </div>

        {/* ── Summary + action ─────────────────────────────────────── */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 pt-4 pb-6 space-y-3">

            {/* Line items */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Discount (5%)</span>
                <span className="font-medium">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sales tax (8%)</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-xl font-extrabold text-orange-500">{formatCurrency(total)}</span>
            </div>

            {/* CTA */}
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 text-sm transition-colors shadow-sm shadow-orange-200 dark:shadow-orange-900/30"
            >
              <CheckCircle className="h-4 w-4" />
              Continue to Payment
            </button>

            {/* Clear */}
            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1"
            >
              Clear order
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product, inCart, onAdd,
}: {
  product: POSProduct;
  inCart: number;
  onAdd: () => void;
}) {
  return (
    <div
      onClick={onAdd}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-white dark:bg-gray-800 border cursor-pointer",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        inCart > 0
          ? "border-orange-300 dark:border-orange-600 ring-1 ring-orange-200 dark:ring-orange-900"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Image area */}
      <div className={cn(
        "relative flex items-center justify-center rounded-t-2xl h-32 text-5xl select-none",
        product.emojiBg
      )}>
        {product.emoji}

        {/* In-cart badge */}
        {inCart > 0 && (
          <span className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {inCart}
          </span>
        )}

        {/* Cart add button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-md text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{product.category}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">
          {product.name}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-snug">
          {product.description}
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-sm font-extrabold text-orange-500">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            / {product.unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Row ─────────────────────────────────────────────────────────────────
function CartRow({
  product, qty, onIncrease, onDecrease, onRemove,
}: {
  product: POSProduct;
  qty: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 group transition-colors">

      {/* Emoji thumbnail */}
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl select-none",
        product.emojiBg
      )}>
        {product.emoji}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
        <p className="text-xs font-bold text-orange-500 mt-0.5">{formatCurrency(product.price)}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onDecrease}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors text-sm font-bold"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-xs font-bold text-gray-800 dark:text-gray-200 tabular-nums">
          {qty}
        </span>
        <button
          onClick={onIncrease}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Remove (show on hover) */}
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 ml-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ search, category }: { search: string; category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No products found</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        {search ? `No results for "${search}"` : `No products in "${category}" category`}
      </p>
    </div>
  );
}
