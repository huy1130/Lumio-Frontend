import { api } from "@/lib/api";
import type {
  ApiInventory,
  ApiInventoryItem,
  ConfigureInventoryPayload,
  StockMovementPayload,
  UpdateInventoryQuantitiesPayload,
} from "@/types";

/** Nest: InventoryController @Controller('inventory') — JWT, SHOPOWNER */
export const inventoryService = {
  getInventory(shopId: number): Promise<ApiInventory> {
    return api.get<ApiInventory>(`/inventory/${shopId}`);
  },

  configure(
    shopId: number,
    payload: ConfigureInventoryPayload,
  ): Promise<ApiInventory> {
    return api.patch<ApiInventory>(`/inventory/${shopId}/configure`, payload);
  },

  addStock(
    shopId: number,
    payload: StockMovementPayload,
  ): Promise<ApiInventoryItem> {
    return api.post<ApiInventoryItem>(
      `/inventory/${shopId}/add-stock`,
      payload,
    );
  },

  reduceStock(
    shopId: number,
    payload: StockMovementPayload,
  ): Promise<ApiInventoryItem> {
    return api.post<ApiInventoryItem>(
      `/inventory/${shopId}/reduce-stock`,
      payload,
    );
  },

  updateQuantities(
    shopId: number,
    payload: UpdateInventoryQuantitiesPayload,
  ): Promise<ApiInventoryItem> {
    return api.patch<ApiInventoryItem>(
      `/inventory/${shopId}/quantities`,
      payload,
    );
  },

  getAlerts(shopId: number): Promise<ApiInventoryItem[]> {
    return api.get<ApiInventoryItem[]>(`/inventory/${shopId}/alerts`);
  },
};
