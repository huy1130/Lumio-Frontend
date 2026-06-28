import { api } from "@/lib/api";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestPayload {
  tenant_id: number;
  shop_id?: number | null;
  message: string;
  history?: ChatMessage[];
  period_days?: number;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    data_used: string[];
    suggestions?: string[];
  };
}

export const aiAdvisorService = {
  chat: (payload: ChatRequestPayload) => {
    return api.post<ChatResponse>("/ai-advisor/chat", payload);
  },
};
