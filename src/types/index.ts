// ── Roles ─────────────────────────────────────────────────────────────────────
export type Role = "manager" | "admin" | "shop_owner" | "staff" | "cashier";

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl?: string;
  status: "active" | "inactive";
  createdAt: string;
}

// ── Merchandise ───────────────────────────────────────────────────────────────
export interface Merchandise {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  status: "active" | "inactive";
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

// ── Order ─────────────────────────────────────────────────────────────────────
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod?: "cash" | "card" | "transfer";
  createdBy: string;
  createdAt: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: "cash" | "card" | "transfer";
  status: "pending" | "completed" | "refunded" | "failed";
  transactionRef?: string;
  processedAt: string;
  processedBy: string;
}

// ── Subscription ──────────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  planName: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxUsers: number;
  maxProducts: number;
  status: "active" | "inactive";
}

// ── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  badge?: string | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Stats card ────────────────────────────────────────────────────────────────
export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
  color: string;
}
