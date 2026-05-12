"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Filter, LayoutGrid, List,
  MoreVertical, Pencil, Trash2, ShoppingBag, Package, CheckCircle, XCircle, Tag,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductsPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <ProductsContent />
    </AccessGuard>
  );
}

function ProductsContent() {
  const { role } = useAuth();

  if (role === "shop_owner") {
    return (
      <PlaceholderPage
        title="Products"
        description="Manage your store products and categories"
        role="shop_owner"
        breadcrumbs={[{ label: "Shop Owner" }, { label: "Products" }]}
        stats={[
          { title: "Total Products", value: "142", change: 7,  changeLabel: "this month", icon: <Package className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
          { title: "Active",         value: "130", change: 5,  changeLabel: "this month", icon: <CheckCircle className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
          { title: "Inactive",       value: "12",  change: 2,  changeLabel: "this month", icon: <XCircle className="h-4 w-4" />,     iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
          { title: "Categories",     value: "8",   change: 1,  changeLabel: "total",      icon: <Tag className="h-4 w-4" />,         iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
        ]}
        tableTitle="Product List"
        actions={<Button size="sm"><Package className="h-4 w-4 mr-1.5" />Add Product</Button>}
      />
    );
  }

  return <AdminProductsView />;
}

// ─── Category config ──────────────────────────────────────────────────────────
interface CategoryMeta {
  icon: string;
  activeColor: string;
  activeBg: string;
  borderColor: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  Beverages: { icon: "☕", activeColor: "text-amber-700 dark:text-amber-400",  activeBg: "bg-amber-50 dark:bg-amber-900/30",   borderColor: "border-amber-500" },
  Dairy:     { icon: "🥛", activeColor: "text-sky-700 dark:text-sky-400",      activeBg: "bg-sky-50 dark:bg-sky-900/30",       borderColor: "border-sky-500"   },
  Bakery:    { icon: "🥐", activeColor: "text-orange-700 dark:text-orange-400",activeBg: "bg-orange-50 dark:bg-orange-900/30", borderColor: "border-orange-500"},
};

const FALLBACK_META: CategoryMeta = {
  icon: "📦",
  activeColor: "text-indigo-700 dark:text-indigo-400",
  activeBg:    "bg-indigo-50 dark:bg-indigo-900/30",
  borderColor: "border-indigo-500",
};

const AVATAR_PALETTE = ["bg-indigo-500","bg-teal-500","bg-rose-500","bg-amber-500","bg-violet-500","bg-emerald-500"];

function ProductAvatar({ product, size = "md" }: { product: Product; size?: "sm" | "md" }) {
  const bg  = AVATAR_PALETTE[parseInt(product.id, 10) % AVATAR_PALETTE.length];
  const dim = size === "md" ? "h-16 w-16 text-xl" : "h-9 w-9 text-sm";
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white shrink-0", bg, dim)}>
      {product.name.charAt(0)}
    </div>
  );
}

function StockBadge({ product }: { product: Product }) {
  if (product.stock === 0)               return <Badge variant="destructive">Out of stock</Badge>;
  if (product.stock < product.minStock)  return <Badge variant="warning">Low stock</Badge>;
  return <Badge variant="success">In stock</Badge>;
}

function AdminProductsView() {
  const [products]                                  = useState<Product[]>(mockProducts);
  const [search, setSearch]                         = useState("");
  const [selectedCategory, setSelectedCategory]     = useState<string>("all");
  const [viewMode, setViewMode]                     = useState<"grid" | "list">("grid");

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.category] = (map[p.category] ?? 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [products]);

  const visibleProducts = useMemo(() => products.filter((p) => {
    const matchCat  = selectedCategory === "all" || p.category === selectedCategory;
    const matchText = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  }), [products, selectedCategory, search]);

  const activeMeta    = selectedCategory === "all" ? FALLBACK_META : (CATEGORY_META[selectedCategory] ?? FALLBACK_META);
  const categoryLabel = selectedCategory === "all" ? `All Products (${visibleProducts.length})` : `${selectedCategory} (${visibleProducts.length})`;

  return (
    <div className="flex h-full min-h-0">

      {/* Category sidebar */}
      <aside className="w-56 shrink-0 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-4 pt-5 pb-3 shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Products Category</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
          <CategoryRow icon="🏪" label="All Products" count={products.length} active={selectedCategory === "all"}
            activeColor="text-indigo-700 dark:text-indigo-400" activeBg="bg-indigo-50 dark:bg-indigo-900/30"
            borderColor="border-indigo-500" onClick={() => setSelectedCategory("all")} />
          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
          {categories.map(({ name, count }) => {
            const meta = CATEGORY_META[name] ?? FALLBACK_META;
            return (
              <CategoryRow key={name} icon={meta.icon} label={name} count={count}
                active={selectedCategory === name} activeColor={meta.activeColor}
                activeBg={meta.activeBg} borderColor={meta.borderColor}
                onClick={() => setSelectedCategory(name)} />
            );
          })}
        </nav>
        <div className="shrink-0 p-3 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-gray-500 dark:text-gray-400 border-dashed">
            <Plus className="h-3.5 w-3.5" /> Add New Category
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"><Filter className="h-4 w-4" /> Filter</Button>
            <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
              {(["grid", "list"] as const).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={cn("flex items-center justify-center w-8 h-8 transition-colors",
                    viewMode === mode ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}>
                  {mode === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
            <Button className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shrink-0" size="sm">
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">{activeMeta.icon}</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{categoryLabel}</h2>
          </div>

          {viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              <button className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center transition-all hover:border-teal-400 hover:shadow-md min-h-[200px]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-500 group-hover:bg-teal-100">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">Add New Product</p>
              </button>
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead>
                    <TableHead>Price</TableHead><TableHead>Cost</TableHead><TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <ProductAvatar product={product} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{product.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{product.sku}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          {(CATEGORY_META[product.category] ?? FALLBACK_META).icon} {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">{formatCurrency(product.cost)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{product.stock}</span><StockBadge product={product} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "success" : "secondary"}>{product.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {visibleProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">No products found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {search ? `No results for "${search}"` : "This category has no products yet."}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

interface CategoryRowProps { icon: string; label: string; count: number; active: boolean; activeColor: string; activeBg: string; borderColor: string; onClick: () => void; }
function CategoryRow({ icon, label, count, active, activeColor, activeBg, borderColor, onClick }: CategoryRowProps) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all text-left border-l-2",
      active ? [activeBg, activeColor, borderColor] : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100")}>
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        active ? "bg-white/60 dark:bg-black/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400")}>{count}</span>
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  const meta = CATEGORY_META[product.category] ?? FALLBACK_META;
  return (
    <div className="group relative flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
      <input type="checkbox" className="absolute top-3 left-3 h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()} />
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ProductAvatar product={product} size="md" />
      <span className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.activeBg, meta.activeColor)}>
        {meta.icon} {product.category}
      </span>
      <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{product.name}</p>
      <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</p>
      <div className="mt-3 w-full"><StockBadge product={product} /></div>
    </div>
  );
}
