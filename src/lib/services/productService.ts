import { api } from "@/lib/api";
import type {
  ApiProduct,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types";

const BASE = "/products";

export const productService = {
  create(payload: CreateProductPayload): Promise<ApiProduct> {
    return api.post<ApiProduct>(BASE, payload);
  },

  getAll(): Promise<ApiProduct[]> {
    return api.get<ApiProduct[]>(BASE);
  },

  getById(id: number): Promise<ApiProduct> {
    return api.get<ApiProduct>(`${BASE}/${id}`);
  },

  update(id: number, payload: UpdateProductPayload): Promise<ApiProduct> {
    return api.patch<ApiProduct>(`${BASE}/${id}`, payload);
  },

  activate(id: number): Promise<ApiProduct> {
    return api.patch<ApiProduct>(`${BASE}/${id}/activate`);
  },

  deactivate(id: number): Promise<ApiProduct> {
    return api.patch<ApiProduct>(`${BASE}/${id}/deactivate`);
  },
};
