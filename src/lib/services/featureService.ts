import { api } from "@/lib/api";
import type {
  ApiFeature,
  CreateFeaturePayload,
  UpdateFeaturePayload,
} from "@/types";

const BASE = "/features";

export const featureService = {
  getAll(): Promise<ApiFeature[]> {
    return api.get<ApiFeature[]>(BASE);
  },

  getById(id: number): Promise<ApiFeature> {
    return api.get<ApiFeature>(`${BASE}/${id}`);
  },

  create(payload: CreateFeaturePayload): Promise<ApiFeature> {
    return api.post<ApiFeature>(BASE, payload);
  },

  update(id: number, payload: UpdateFeaturePayload): Promise<ApiFeature> {
    return api.patch<ApiFeature>(`${BASE}/${id}`, payload);
  },

  remove(id: number): Promise<void> {
    return api.delete<void>(`${BASE}/${id}`);
  },
};
