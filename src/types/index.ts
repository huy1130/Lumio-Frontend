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

// ── Customer ─────────────────────────────────────────────────────────────────
export interface Customer {
  id: number;
  tenant_id: number;
  phone: string;
  full_name: string;
  member_rank: string | null;
  loyalty_point: number;
  created_at: string;
}

export interface CreateCustomerPayload {
  phone: string;
  full_name: string;
  tenant_id?: number;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface Tenant {
  id: number;
  tenant_name: string;
  is_active: boolean;
  admin_id?: number | null;
  tax_percentage?: number | string | null;
  loyal_point_per_unit?: number | string | null;
  created_at?: string;
  update_at?: string;
}

export interface CreateTenantPayload {
  tenant_name: string;
  admin_id?: number;
  tax_percentage?: number;
  loyal_point_per_unit?: number;
}

export type UpdateTenantPayload = Partial<CreateTenantPayload>;

// ── Role (backend `roles` table) ─────────────────────────────────────────────
export interface ApiRole {
  id: number;
  role_code: string;
  description: string | null;
  permissions: Record<string, unknown> | null;
}

export interface CreateRolePayload {
  role_code: string;
  description?: string;
  permissions?: Record<string, unknown>;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

// ── Feature (backend `features` table) ─────────────────────────────────────────
export interface ApiFeature {
  id: number;
  feature_code: string;
  description: string | null;
  is_active: boolean;
}

export interface CreateFeaturePayload {
  feature_code: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateFeaturePayload = Partial<CreateFeaturePayload>;

// ── Product Category ────────────────────────────────────────────────────────
export interface ApiCategory {
  id: number;
  par_category_id: number | null;
  tenant_id: number;
  category_name: string;
  is_active: boolean;
  parent?: ApiCategory | null;
  children?: ApiCategory[];
}

export interface CreateCategoryPayload {
  category_name: string;
  par_category_id?: number | null;
  is_active?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ── Ingredient ────────────────────────────────────────────────────────────────
export interface ApiIngredient {
  id: number;
  tenant_id: number;
  name: string;
  unit: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  update_at: string;
  ingredient_products?: IngredientProductLink[];
}

export interface IngredientProductLink {
  product_id: number;
  ingredient_id: number;
  quantity_required: number | string;
  unit: string | null;
  ingredient?: ApiIngredient;
  product?: { id: number; name?: string };
}

export interface CreateIngredientPayload {
  name: string;
  unit?: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateIngredientPayload = Partial<CreateIngredientPayload>;

export interface UpsertIngredientProductPayload {
  ingredient_id: number;
  quantity_required: number;
  unit?: string;
}

// ── Product ───────────────────────────────────────────────────────────────────
export interface ApiProduct {
  id: number;
  tenant_id: number;
  category_id: number;
  product_name: string;
  sku: string;
  basic_price: number | string;
  unit_price: number | string;
  barcode: string | null;
  description: string | null;
  measure_unit: string | null;
  is_active: boolean;
  created_at: string;
  update_at: string;
  category?: { id: number; category_name: string };
}

export interface CreateProductPayload {
  category_id: number;
  product_name: string;
  sku: string;
  basic_price: number;
  unit_price: number;
  barcode?: string;
  description?: string;
  measure_unit?: string;
  is_active?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

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

// ── Inventory (legacy mock UI) ────────────────────────────────────────────────
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

/** Nest inventory API — tồn nguyên liệu theo shop */
export interface ApiInventory {
  id: number;
  shop_id: number;
  current_quantity: number;
  minimum_threshold: number | null;
  reorder_quantity: number | null;
  last_restock_at: string | null;
  update_at: string;
  inventory_items: ApiInventoryItem[];
}

export interface ApiInventoryItem {
  id: number;
  ingredient_id: number;
  inventory_id: number;
  theorical_quantity: number;
  adjusted_quantity: number | null;
  actual_quantity: number | null;
  updated_at: string;
  ingredient: ApiIngredient;
}

export interface ConfigureInventoryPayload {
  minimum_threshold?: number;
  reorder_quantity?: number;
}

export interface StockMovementPayload {
  ingredient_id: number;
  quantity: number;
}

export interface UpdateInventoryQuantitiesPayload {
  ingredient_id: number;
  theorical_quantity?: number;
  adjusted_quantity?: number;
  actual_quantity?: number;
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
  /** Gắn feature MAX_SHOPS trên BE khi tạo gói */
  max_shops?: number;
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

/** GET /subscriptions/stats (admin) */
export interface SubscriptionPackageStat {
  id: number;
  package_code: string;
  description: string | null;
  price: string | number;
  total_purchased: number;
  total_renewals: number;
  total_payments: number;
  revenue: string | number;
}

export interface SubscriptionStatsResponse {
  totalRevenue: string | number;
  totalPayments: number;
  totalRenewals: number;
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
