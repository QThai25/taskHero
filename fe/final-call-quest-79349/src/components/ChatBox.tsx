import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatApi } from "../api/chatbot";
import logo from "@/assets/logo.jpg";
import { useEffect, useRef } from "react";
type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "👋 Xin chào! Bạn muốn mình nhắc việc gì?" },
  ]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatApi.send(userText);
      const data = res.data;

      let botReply = "🤔 Mình chưa có phản hồi phù hợp";

      if (data?.reply) {
        botReply = data.reply;
      } else if (data?.title) {
        botReply = `📝 Đã tạo task "${data.title}" cho bạn rồi 👌`;
      }

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ Oops, có lỗi xảy ra khi xử lý yêu cầu.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔘 NÚT CHAT */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                     bg-gradient-to-r from-primary to-accent
                     flex items-center justify-center shadow-xl
                     hover:scale-110 transition"
        >
          <MessageCircle className="text-white w-6 h-6" />
        </button>
      )}

      {/* 💬 HỘP CHAT */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50
                     w-[360px] h-[480px]
                     bg-background border border-border
                     rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Final Call Bot"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold">Final Call Bot</span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-line ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="bg-secondary px-3 py-2 rounded-lg w-fit">
                ⏳ Đang xử lý...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập yêu cầu..."
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <Button onClick={handleSend} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
