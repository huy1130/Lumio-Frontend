import { api } from "@/lib/api";
import type {
  ApiCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";

const BASE = "/product-categories";

export const categoryService = {
  getAll(): Promise<ApiCategory[]> {
    return api.get<ApiCategory[]>(BASE);
  },

  getById(id: number): Promise<ApiCategory> {
    return api.get<ApiCategory>(`${BASE}/${id}`);
  },

  create(payload: CreateCategoryPayload): Promise<ApiCategory> {
    return api.post<ApiCategory>(BASE, payload);
  },

  update(id: number, payload: UpdateCategoryPayload): Promise<ApiCategory> {
    return api.patch<ApiCategory>(`${BASE}/${id}`, payload);
  },

  delete(id: number): Promise<ApiCategory> {
    return api.delete<ApiCategory>(`${BASE}/${id}`);
  },
};