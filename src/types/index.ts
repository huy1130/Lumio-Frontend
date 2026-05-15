// ── Roles ─────────────────────────────────────────────────────────────────────
import type { Role } from "@/lib/roles";
export type { Role } from "@/lib/roles";

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

// ── Subscription (mock / marketing UI) ────────────────────────────────────────
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

// ── ApiSubscription (matches backend Prisma model) ─────────────────────────────
export interface ApiSubscription {
  id: number;
  package_code: string;
  description: string | null;
  price: string;           // Prisma Decimal serialises as string
  billing_cycle: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateSubscriptionPayload {
  package_code: string;
  description?: string;
  price: number;
  billing_cycle: string;
  is_active?: boolean;
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

/** GET /subscriptions/stats (admin) */
export interface SubscriptionPackageStat {
  id: number;
  package_code: string;
  description: string | null;
  price: string | number;
  total_purchased: number;
}

export interface SubscriptionStatsResponse {
  totalRevenue: string | number;
  packageStats: SubscriptionPackageStat[];
}

// ── Admin (matches backend Prisma model) ──────────────────────────────────────
export interface ApiAdmin {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  manager_id: number | null;
  /** Backend Prisma field `last_login` (ISO string) */
  last_login: string | null;
  created_at: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: ApiAdmin;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
}

export type UpdateAdminPayload = Partial<Omit<CreateAdminPayload, "email"> & { email?: string }>;

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
