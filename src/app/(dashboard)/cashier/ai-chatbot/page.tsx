"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const INITIAL: Message[] = [
  { role: "bot", text: "👋 Hi! I'm your AI assistant. Ask me anything about products, orders, or how to use the POS system." },
];

const QUICK = [
  "How do I process a return?",
  "What's our best-selling product today?",
  "How to apply a discount?",
  "Check stock for Espresso Beans",
];

const BOT_REPLIES: Record<string, string> = {
  "How do I process a return?": "To process a return: go to Payments → find the order → click 'Refund'. Select items and reason, then confirm. 💡",
  "What's our best-selling product today?": "Today's top seller is **Espresso Beans 1kg** with 18 units sold, generating $449.82 in revenue. ☕",
  "How to apply a discount?": "When creating an order, tap the discount icon (%) in the order summary panel. You can enter a % or fixed amount. 🏷️",
  "Check stock for Espresso Beans": "**Espresso Beans 1kg** — Current stock: 50 kg ✅ (Min: 10 kg). Stock is healthy!",
};

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    const botReply: Message = {
      role: "bot",
      text: BOT_REPLIES[text] ?? `I understand you're asking about "${text}". This feature will connect to the AI backend when available. 🤖`,
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Chatbot"
          description="Ask the AI assistant for help with orders, products, and procedures"
          role="cashier"
          breadcrumbs={[{ label: "Cashier" }, { label: "AI Chatbot" }]}
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat */}
          <Card className="lg:col-span-3 flex flex-col" style={{ minHeight: "520px" }}>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                AI Assistant
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online (demo)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-3 p-4">
              {/* Messages */}
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
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "bot"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => send(input)} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700 transition-colors"
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
