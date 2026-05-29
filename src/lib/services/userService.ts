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

export const userService = {
  createCashier: (payload: CreateCashierPayload): Promise<CreateCashierResponse> => {
    return api.post<CreateCashierResponse>("/users/cashiers", payload);
  },
};
