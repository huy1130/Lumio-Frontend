import { api } from "@/lib/api";

// ── Shift Templates ────────────────────────────────────────────────────────
export interface ApiShiftTemplate {
  id: number;
  tenant_id: number;
  name: string;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  is_active: boolean;
}

export interface CreateShiftTemplatePayload {
  name: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export type UpdateShiftTemplatePayload = Partial<CreateShiftTemplatePayload>;

// ── Shifts ─────────────────────────────────────────────────────────────────
export interface ApiShift {
  id: number;
  shop_id: number;
  tenant_id: number;
  template_id: number;
  shift_date: string;
  shift_status: string; // 'OPEN', 'CLOSED', etc.
  start_time: string; // Date string or time string
  end_time: string;
  template?: ApiShiftTemplate;
  users?: {
    user: {
      id: number;
      username: string;
      full_name: string;
    };
  }[];
}

export interface CreateShiftPayload {
  shop_id: number;
  template_id: number;
  shift_date: string; // YYYY-MM-DD
  cashiers: number[];
  shift_status?: string;
}

export interface UpdateShiftPayload {
  template_id?: number;
  shift_date?: string;
  cashiers?: number[];
  shift_status?: string;
}

export const shiftService = {
  // Templates
  createTemplate: (payload: CreateShiftTemplatePayload) => {
    return api.post<ApiShiftTemplate>("/shift-templates", payload);
  },
  getTemplates: () => {
    return api.get<ApiShiftTemplate[]>("/shift-templates");
  },
  updateTemplate: (id: number, payload: UpdateShiftTemplatePayload) => {
    return api.patch<ApiShiftTemplate>(`/shift-templates/${id}`, payload);
  },
  deleteTemplate: (id: number) => {
    return api.delete(`/shift-templates/${id}`);
  },

  // Shifts
  createShift: (payload: CreateShiftPayload) => {
    return api.post<ApiShift>("/shifts", payload);
  },
  getShiftsByShop: (shopId: number) => {
    return api.get<ApiShift[]>(`/shifts/shop/${shopId}`);
  },
  updateShift: (id: number, payload: UpdateShiftPayload) => {
    return api.patch<ApiShift>(`/shifts/${id}`, payload);
  },
  deleteShift: (id: number) => {
    return api.delete(`/shifts/${id}`);
  },
};
