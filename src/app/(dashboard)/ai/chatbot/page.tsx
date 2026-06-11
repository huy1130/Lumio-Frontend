"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, Bot, User, Loader2 } from "lucide-react";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { chatbotService } from "@/lib/services/chatbotService";

export default function AIChatbotPage() {
  // Chatbot accesses by shop_owner and cashier to query operations and statistics
  return (
    <AccessGuard roles={["shop_owner", "cashier"]}>
      <AIChatbotContent />
    </AccessGuard>
  );
}

interface Message { role: "user" | "bot"; text: string; }

const INITIAL: Message[] = [
  { role: "bot", text: "👋 Xin chào! Tôi là trợ lý AI thông minh Lumio. Tôi có thể hỗ trợ bạn kiểm tra báo cáo doanh số, lợi nhuận, top món bán chạy, quy trình POS hoặc trả hàng. Hãy hỏi tôi bất cứ điều gì!" },
];

const QUICK = [
  "Doanh thu tháng này thế nào?",
  "Món nào bán chạy nhất?",
  "Cách áp dụng giảm giá?",
  "Quy trình hoàn tiền thế nào?",
];

function AIChatbotContent() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    // 1. Add user message
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // 2. Call backend chatbot API
      const res = await chatbotService.ask(text);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `⚠️ Đã có lỗi xảy ra: ${err.message || "Không thể kết nối đến máy chủ AI."}` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Chatbot"
          description="Hỏi trợ lý ảo thông minh về doanh thu, các quy trình và thông tin cửa hàng."
          role="shop_owner"
          breadcrumbs={[{ label: "Trợ lý ảo" }, { label: "AI Chatbot" }]}
        />
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-3 flex flex-col" style={{ minHeight: "520px" }}>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                AI Assistant
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Trực tuyến
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-3 p-4">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      m.role === "bot"
                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {m.role === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                      m.role === "bot"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-tl-sm italic">
                      Đang xử lý câu trả lời...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Hỏi bất cứ điều gì..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button size="icon" onClick={() => send(input)} className="bg-indigo-600 hover:bg-indigo-700 shrink-0" disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Câu hỏi gợi ý</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700 transition-colors"
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
