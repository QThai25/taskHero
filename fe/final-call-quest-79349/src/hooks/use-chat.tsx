import { useState } from "react";
import { chatApi } from "@/api/chatbot";
import { useQueryClient } from "@tanstack/react-query";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await chatApi.send(text);

      if (res.data.reply) {
        setMessages((m) => [...m, { role: "ai", content: res.data.reply }]);
      } else if (res.data.title) {
        setMessages((m) => [
          ...m,
          { role: "ai", content: `✅ Đã tạo task: ${res.data.title}` },
        ]);

        // 🔥 refresh list
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["reminders"] });
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", content: "❌ Có lỗi xảy ra, thử lại nhé" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
