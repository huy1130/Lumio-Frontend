export interface Shop {
  id: number;
  tenant_id: number;
  shop_name: string;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  update_at: string;
}

export interface CreateShopPayload {
  shop_name: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
}
