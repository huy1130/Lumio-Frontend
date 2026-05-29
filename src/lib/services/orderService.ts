import { api } from "@/lib/api";

export interface ApiOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  sub_total: string;
  product?: { id: number; product_name: string };
}

export interface ApiOrder {
  id: number;
  shop_id: number;
  customer_id: number | null;
  shift_id: number;
  subtotal_amount: string | number;
  grand_total: string | number;
  notes: string | null;
  order_status: string;
  created_at: string;
  update_at: string;
  order_items: ApiOrderItem[];
  customer?: { id: number; full_name: string };
}

export interface CreateOrderPayload {
  shift_id: number;
  customer_id?: number;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export type UpdateOrderPayload = {
  status?: string;
  notes?: string;
};

export const orderService = {
  create: (shopId: number, payload: CreateOrderPayload) => {
    return api.post<ApiOrder>(`/shops/${shopId}/orders`, payload);
  },

  getAll: (shopId: number) => {
    return api.get<ApiOrder[]>(`/shops/${shopId}/orders`);
  },

  getById: (shopId: number, id: number) => {
    return api.get<ApiOrder>(`/shops/${shopId}/orders/${id}`);
  },

  update: (shopId: number, id: number, payload: UpdateOrderPayload) => {
    return api.patch<ApiOrder>(`/shops/${shopId}/orders/${id}`, payload);
  },
};
