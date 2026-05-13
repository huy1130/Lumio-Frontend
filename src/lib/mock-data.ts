import type {
  Product,
  InventoryItem,
  Order,
  Payment,
  Subscription,
  Merchandise,
  User,
} from "@/types";

export const mockUsers: User[] = [
  { id: "1", name: "Alice Manager", email: "manager@pos.com", role: "manager", createdAt: "2024-01-01" },
  { id: "2", name: "Bob Admin", email: "admin@pos.com", role: "admin", createdAt: "2024-01-02" },
  { id: "3", name: "Carol Staff", email: "staff@pos.com", role: "staff", createdAt: "2024-01-03" },
  { id: "4", name: "Dave Cashier", email: "cashier@pos.com", role: "cashier", createdAt: "2024-01-04" },
];

export const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    planName: "Starter",
    price: 119000,
    billingCycle: "monthly",
    features: ["Up to 2 users", "100 products", "Basic reports", "Email support"],
    maxUsers: 2,
    maxProducts: 100,
    status: "active",
  },
  {
    id: "2",
    planName: "Professional",
    price: 159000,
    billingCycle: "monthly",
    features: ["Up to 10 users", "1,000 products", "Advanced analytics", "Priority support", "Multi-location"],
    maxUsers: 10,
    maxProducts: 1000,
    status: "active",
  },
  {
    id: "3",
    planName: "Enterprise",
    price: 299000,
    billingCycle: "monthly",
    features: ["Unlimited users", "Unlimited products", "Custom reports", "24/7 support", "API access", "White label"],
    maxUsers: -1,
    maxProducts: -1,
    status: "active",
  },
];

export const mockProducts: Product[] = [
  { id: "1", name: "Espresso Beans 1kg", sku: "BEAN-001", category: "Beverages", price: 24.99, cost: 12.5, stock: 50, minStock: 10, unit: "kg", status: "active", createdAt: "2024-01-10" },
  { id: "2", name: "Whole Milk 1L", sku: "MILK-001", category: "Dairy", price: 2.99, cost: 1.5, stock: 5, minStock: 20, unit: "L", status: "active", createdAt: "2024-01-10" },
  { id: "3", name: "Blueberry Muffin", sku: "MUFF-001", category: "Bakery", price: 3.49, cost: 1.2, stock: 30, minStock: 15, unit: "pcs", status: "active", createdAt: "2024-01-11" },
  { id: "4", name: "Green Tea Bags", sku: "TEA-001", category: "Beverages", price: 8.99, cost: 4.0, stock: 0, minStock: 10, unit: "box", status: "active", createdAt: "2024-01-12" },
  { id: "5", name: "Croissant", sku: "CROI-001", category: "Bakery", price: 2.99, cost: 0.9, stock: 20, minStock: 10, unit: "pcs", status: "active", createdAt: "2024-01-12" },
  { id: "6", name: "Oat Milk 1L", sku: "OMILK-001", category: "Dairy", price: 4.49, cost: 2.2, stock: 15, minStock: 10, unit: "L", status: "active", createdAt: "2024-01-13" },
];

export const mockMerchandises: Merchandise[] = [
  { id: "1", name: "Branded Coffee Mug", description: "16oz ceramic mug with logo", price: 14.99, category: "Drinkware", status: "active" },
  { id: "2", name: "Tote Bag", description: "Eco-friendly cotton tote bag", price: 12.99, category: "Accessories", status: "active" },
  { id: "3", name: "Travel Tumbler", description: "Stainless steel 20oz tumbler", price: 29.99, category: "Drinkware", status: "active" },
  { id: "4", name: "Logo T-Shirt", description: "Cotton t-shirt with store branding", price: 24.99, category: "Apparel", status: "inactive" },
];

export const mockInventory: InventoryItem[] = mockProducts.map((p) => ({
  id: p.id,
  productId: p.id,
  productName: p.name,
  sku: p.sku,
  currentStock: p.stock,
  minStock: p.minStock,
  maxStock: p.minStock * 10,
  unit: p.unit,
  location: "Warehouse A",
  lastUpdated: "2024-04-01",
  status:
    p.stock === 0
      ? "out_of_stock"
      : p.stock < p.minStock
      ? "low_stock"
      : "in_stock",
}));

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-0001",
    customerName: "John Doe",
    items: [
      { productId: "1", productName: "Espresso Beans 1kg", quantity: 2, unitPrice: 24.99, subtotal: 49.98 },
      { productId: "3", productName: "Blueberry Muffin", quantity: 1, unitPrice: 3.49, subtotal: 3.49 },
    ],
    subtotal: 53.47,
    tax: 4.28,
    discount: 0,
    total: 57.75,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdBy: "Carol Staff",
    createdAt: "2024-04-10T09:30:00",
  },
  {
    id: "2",
    orderNumber: "ORD-0002",
    customerName: "Jane Smith",
    items: [
      { productId: "5", productName: "Croissant", quantity: 3, unitPrice: 2.99, subtotal: 8.97 },
      { productId: "6", productName: "Oat Milk 1L", quantity: 2, unitPrice: 4.49, subtotal: 8.98 },
    ],
    subtotal: 17.95,
    tax: 1.44,
    discount: 2.0,
    total: 17.39,
    status: "processing",
    paymentStatus: "unpaid",
    createdBy: "Carol Staff",
    createdAt: "2024-04-10T10:15:00",
  },
  {
    id: "3",
    orderNumber: "ORD-0003",
    customerName: "Walk-in Customer",
    items: [
      { productId: "2", productName: "Whole Milk 1L", quantity: 4, unitPrice: 2.99, subtotal: 11.96 },
    ],
    subtotal: 11.96,
    tax: 0.96,
    discount: 0,
    total: 12.92,
    status: "pending",
    paymentStatus: "unpaid",
    createdBy: "Carol Staff",
    createdAt: "2024-04-10T11:00:00",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "1",
    orderId: "1",
    orderNumber: "ORD-0001",
    amount: 57.75,
    method: "card",
    status: "completed",
    transactionRef: "TXN-ABC123",
    processedAt: "2024-04-10T09:32:00",
    processedBy: "Dave Cashier",
  },
  {
    id: "2",
    orderId: "2",
    orderNumber: "ORD-0002",
    amount: 17.39,
    method: "cash",
    status: "pending",
    processedAt: "2024-04-10T10:16:00",
    processedBy: "Dave Cashier",
  },
];
