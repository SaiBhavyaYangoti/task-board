import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import type { Task, Column } from "../types";
import { answerQuery } from "../lib/chatbotEngine";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! Ask me about your board — statuses, priorities, due dates, assignees." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    try {
      const [tasksRes, columnsRes] = await Promise.all([
        api.get<Task[]>("/tasks"),
        api.get<Column[]>("/columns"),
      ]);
      const answer = answerQuery(question, tasksRes.data, columnsRes.data);
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't reach the board data. Try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Board Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm whitespace-pre-line rounded-lg px-3 py-2 max-w-[90%] ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {m.text}
              </div>
            ))}
            {thinking && <div className="text-xs text-slate-400 px-1">Thinking...</div>}
          </div>
          <form onSubmit={handleSend} className="p-2 border-t border-slate-200 flex gap-2">
            <input
              className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ask about your tasks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-3"
            >
              Send
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl ml-auto"
        title="Board Assistant"
      >
        💬
      </button>
    </div>
  );
}
