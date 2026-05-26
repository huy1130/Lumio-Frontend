import { api } from "@/lib/api";
import type {
  ApiIngredient,
  CreateIngredientPayload,
  IngredientProductLink,
  UpdateIngredientPayload,
  UpsertIngredientProductPayload,
} from "@/types";

const BASE = "/ingredients";

/** Nest: IngredientController @Controller('ingredients') — JWT, SHOPOWNER */
export const ingredientService = {
  getAll(): Promise<ApiIngredient[]> {
    return api.get<ApiIngredient[]>(BASE);
  },

  getById(id: number): Promise<ApiIngredient> {
    return api.get<ApiIngredient>(`${BASE}/${id}`);
  },

  create(payload: CreateIngredientPayload): Promise<ApiIngredient> {
    return api.post<ApiIngredient>(BASE, payload);
  },

  update(id: number, payload: UpdateIngredientPayload): Promise<ApiIngredient> {
    return api.patch<ApiIngredient>(`${BASE}/${id}`, payload);
  },

  delete(id: number): Promise<ApiIngredient> {
    return api.delete<ApiIngredient>(`${BASE}/${id}`);
  },

  /** BOM: ingredients required for a product */
  getByProduct(productId: number): Promise<IngredientProductLink[]> {
    return api.get<IngredientProductLink[]>(`${BASE}/product/${productId}`);
  },

  upsertProductLink(
    productId: number,
    payload: UpsertIngredientProductPayload,
  ): Promise<IngredientProductLink> {
    return api.post<IngredientProductLink>(
      `${BASE}/product/${productId}`,
      payload,
    );
  },

  removeProductLink(
    productId: number,
    ingredientId: number,
  ): Promise<void> {
    return api.delete<void>(
      `${BASE}/product/${productId}/${ingredientId}`,
    );
  },
};
