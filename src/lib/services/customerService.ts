import { api } from "@/lib/api";

export interface ApiCustomer {
  id: number;
  phone: string;
  full_name: string;
  tenant_id?: number;
  created_at?: string;
  update_at?: string;
}

export const customerService = {
  getAll: () => {
    return api.get<ApiCustomer[]>("/customers");
  },
  create: (payload: { phone: string; full_name: string; tenant_id?: number }) => {
    return api.post<ApiCustomer>("/customers", payload);
  }
};
