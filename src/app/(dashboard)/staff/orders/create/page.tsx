"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";

const CATEGORIES = ["All", ...Array.from(new Set(mockProducts.map((p) => p.category)))];

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function CreateOrderPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = activeCategory === "All"
    ? mockProducts
    : mockProducts.filter((p) => p.category === activeCategory);

  function addToCart(product: typeof mockProducts[0]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, productName: product.name, price: product.price, quantity: 1 }];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.productId !== productId) return [i];
        const q = i.quantity + delta;
        return q <= 0 ? [] : [{ ...i, quantity: q }];
      })
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax      = subtotal * 0.08;
  const total    = subtotal + tax;

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Create Order"
          description="Select products and create a new order"
          role="staff"
          breadcrumbs={[{ label: "Staff" }, { label: "Orders" }, { label: "Create" }]}
        />

        <div className="grid gap-6 lg:grid-cols-3" style={{ minHeight: "520px" }}>
          {/* ── Product panel ───────────────────────────────────────────── */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="pb-3">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => {
                  const inCart = cart.find((i) => i.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`relative text-left rounded-xl border p-3 transition-all hover:shadow-sm ${
                        product.stock === 0
                          ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-95"
                      }`}
                    >
                      {inCart && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                          {inCart.quantity}
                        </span>
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mb-2">
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{product.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</span>
                        <StatusBadge status={product.stock === 0 ? "out_of_stock" : "in_stock"} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Order summary ────────────────────────────────────────────── */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Summary
                {cart.length > 0 && (
                  <Badge className="ml-auto">{cart.reduce((s, i) => s + i.quantity, 0)}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-4 gap-3">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                  <ShoppingCart className="h-10 w-10 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-muted-foreground">No items yet</p>
                  <p className="text-xs text-muted-foreground">Click products to add</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => changeQty(item.productId, -1)} className="flex h-6 w-6 items-center justify-center rounded-md border text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => changeQty(item.productId, +1)} className="flex h-6 w-6 items-center justify-center rounded-md border text-gray-500 hover:text-green-500 hover:border-green-300 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button onClick={() => changeQty(item.productId, -item.quantity)} className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tax (8%)</span><span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span><span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Continue to Payment
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setCart([])}>
                    Clear Order
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
