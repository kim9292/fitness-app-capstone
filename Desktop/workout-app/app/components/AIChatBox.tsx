"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", content: data.reply || "Sorry, I don't know, but I'm here to help! 😊" },
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", content: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-xl p-6 border border-purple-100 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">💬 Ask Anything!</h3>
      <div className="h-64 overflow-y-auto bg-purple-50 rounded p-3 mb-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-12">Start the conversation! Ask me anything about fitness, nutrition, or life. 😊</div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "self-end bg-purple-200 text-purple-900 px-4 py-2 rounded-xl max-w-xs"
                : "self-start bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-xl max-w-xs"
            }
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500"
          placeholder="Type your question..."
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-60"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
