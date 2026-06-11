import { api } from "@/lib/api";

export interface ApiNotification {
  id: number;
  tenant_id: number;
  title: string;
  content: string;
  severity_level: "INFO" | "WARNING" | "CRITICAL";
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getAll: () => {
    return api.get<ApiNotification[]>("/notifications");
  },

  markAsRead: (id: number) => {
    return api.patch<void>(`/notifications/${id}/read`, {});
  },
};
