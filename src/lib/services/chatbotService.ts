import { api } from "@/lib/api";

export interface ChatbotAskResponse {
  reply: string;
}

export const chatbotService = {
  ask: (question: string) => {
    return api.post<ChatbotAskResponse>("/chatbot/ask", { question });
  },
};
