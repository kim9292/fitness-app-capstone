"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const FREE_MESSAGE_LIMIT = 3;

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, apiCall, isLoading: authLoading, token } = useAuth();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history on mount (authenticated users only)
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadChatHistory = async () => {
      try {
        const response = await apiCall("/api/user/chat-history", {
          method: "GET",
        });
        if (response.chatHistory && Array.isArray(response.chatHistory)) {
          setMessages(response.chatHistory);
          console.log("Chat history loaded:", response.chatHistory.length, "messages");
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    loadChatHistory();
  }, [isAuthenticated, authLoading, apiCall]);

  // Load guest state from sessionStorage when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const storedCount = sessionStorage.getItem("guestFreeMessagesUsed");
        setFreeMessagesUsed(storedCount ? parseInt(storedCount, 10) || 0 : 0);

        const storedMsgs = sessionStorage.getItem("guestChatMessages");
        if (storedMsgs) {
          const parsed = JSON.parse(storedMsgs);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        }
      } catch {}
    }
  }, [isAuthenticated]);

  const saveChatHistory = async (updatedMessages: Message[]) => {
    try {
      await apiCall("/api/user/chat-history", {
        method: "POST",
        body: JSON.stringify({ messages: updatedMessages }),
      });
      console.log("Chat history saved:", updatedMessages.length, "messages");
    } catch (err) {
      console.error("Failed to save chat history:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Check free message limit for non-authenticated users
    if (!isAuthenticated && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      setError("Free message limit reached. Sign up to continue chatting!");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      // Always send the user's message to the AI assistant endpoint, regardless of topic
      let response;
      if (isAuthenticated) {
        response = await apiCall("/api/ai-assistant", {
          method: "POST",
          body: JSON.stringify({ message: input }),
        });
      } else {
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });
        response = await res.json();
      }

      // Friendly fallback if no answer
      let responseText = response.reply || response.response || response.message;
      if (!responseText || typeof responseText !== "string" || responseText.trim() === "") {
        responseText = "I'm not sure about that, but I'll do my best to help! 😊";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save to database for authenticated users
      if (isAuthenticated) {
        await saveChatHistory(finalMessages);
      } else {
        // Increment free message counter for non-authenticated users and persist in session
        const newCount = freeMessagesUsed + 1;
        setFreeMessagesUsed(newCount);
        try {
          sessionStorage.setItem("guestFreeMessagesUsed", newCount.toString());
          sessionStorage.setItem("guestChatMessages", JSON.stringify(finalMessages));
        } catch {}
      }
    } catch (err: any) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Oops! Something went wrong, but I'm still here for you. Try asking again or ask me anything else! 😊",
        },
      ]);
      setError("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button with label */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <div className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded shadow-lg border border-white/10">
            AI Chat
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl"
            title="Open AI Chat"
            aria-label="Open AI chat"
          >
            💬
          </button>
        </div>
      )}

      {/* Chat Modal with Overlay */}
      {isOpen && (
        <>
          {/* Clickable Overlay - closes chat when clicked */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
          
          {/* Chat Box */}
          <div className="fixed bottom-6 right-6 w-96 h-screen max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xl hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="text-4xl mb-2">💪</div>
                <p className="text-sm font-semibold text-gray-700">Hi! Ask me anything</p>
                <p className="text-xs text-gray-500 mt-1">about fitness & workouts</p>
                {!isAuthenticated && (
                  <div className="mt-4 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                    <p className="font-semibold text-blue-900">Free Trial: {FREE_MESSAGE_LIMIT - freeMessagesUsed} questions left</p>
                    <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link> for unlimited chat
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-br-none"
                          : "bg-gray-300 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg rounded-bl-none text-sm">
                      <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
            {!isAuthenticated && freeMessagesUsed >= FREE_MESSAGE_LIMIT && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-xs text-center">
                Free messages used! <Link href="/register" className="font-semibold text-blue-600 hover:underline">Sign up</Link> to continue
              </div>
            )}
            {error && (
              <div className="mb-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-xs">
                {error}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading || (!isAuthenticated && freeMessagesUsed >= FREE_MESSAGE_LIMIT)}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || (!isAuthenticated && freeMessagesUsed >= FREE_MESSAGE_LIMIT)}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ⬆️
              </button>
            </form>
            {!isAuthenticated && freeMessagesUsed < FREE_MESSAGE_LIMIT && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {FREE_MESSAGE_LIMIT - freeMessagesUsed} free questions remaining
              </p>
            )}
          </div>
          </div>
        </>
      )}
    </>
  );
}
