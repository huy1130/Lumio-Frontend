import { api } from "@/lib/api";
import type {
  ApiSubscription,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from "@/types";

const BASE = "/subscriptions";

export const subscriptionService = {
  getAll(): Promise<ApiSubscription[]> {
    return api.get<ApiSubscription[]>(BASE);
  },

  getById(id: number): Promise<ApiSubscription> {
    return api.get<ApiSubscription>(`${BASE}/${id}`);
  },

  create(payload: CreateSubscriptionPayload): Promise<ApiSubscription> {
    return api.post<ApiSubscription>(BASE, payload);
  },

  update(id: number, payload: UpdateSubscriptionPayload): Promise<ApiSubscription> {
    return api.patch<ApiSubscription>(`${BASE}/${id}`, payload);
  },

  activate(id: number): Promise<ApiSubscription> {
    return api.patch<ApiSubscription>(`${BASE}/${id}/activate`);
  },

  deactivate(id: number): Promise<ApiSubscription> {
    return api.patch<ApiSubscription>(`${BASE}/${id}/deactivate`);
  },
};
