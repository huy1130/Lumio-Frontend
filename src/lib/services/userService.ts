import { api } from "@/lib/api";

export interface CreateCashierPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  shop_id?: number;
}

export interface CreateCashierResponse {
  message: string;
  email_sent: boolean;
  email_error?: string;
  cashier: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    shop_id: number;
    tenant_id: number;
    role_code: string;
  };
}
export interface StaffMember {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  role: {
    role_code: string;
    description: string | null;
  };
}

export interface GetStaffResponse {
  message: string;
  data: StaffMember[];
}

export const userService = {
  createCashier: (payload: CreateCashierPayload): Promise<CreateCashierResponse> => {
    return api.post<CreateCashierResponse>("/users/cashiers", payload);
  },
  getStaffByShop: (shopId: number): Promise<GetStaffResponse> => {
    return api.get<GetStaffResponse>(`/users/shops/${shopId}/staff`);
  },
};
