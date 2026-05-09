"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, FileText, Menu, Send, Zap } from "lucide-react";
import { AiAnalysisMessage } from "@/components/ai-analysis-message";
import { ChatTypingIndicator } from "@/components/chat-typing-indicator";

const TYPING_MS = 3000;

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AiChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || isAwaitingReply) return;

    setInput("");
    const typingId = createId();
    setIsAwaitingReply(true);
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: "user", text },
      { id: typingId, role: "typing" },
    ]);

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      typingTimeoutRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { id: typingId, role: "assistant" } : m,
        ),
      );
      setIsAwaitingReply(false);
    }, TYPING_MS);
  }, [input, isAwaitingReply]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#FDF8EE] text-[#2D2926]">
      <header className="z-40 shrink-0 border-b border-[#E8E4DC] bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-[#2D2926] hover:bg-[#F0EBE3]"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <nav
              className="flex min-w-0 items-center gap-3 overflow-x-auto text-sm sm:gap-6"
              aria-label="Main"
            >
              <Link
                href="/dashboard"
                className="whitespace-nowrap font-medium text-[#666666] hover:text-[#2D2926]"
              >
                Daily Digest
              </Link>
              <span className="whitespace-nowrap border-b-2 border-[#D4AF37] pb-0.5 font-semibold text-[#2D2926]">
                AI Chatbot
              </span>
              <Link
                href="/competitor-analysis"
                className="whitespace-nowrap font-medium text-[#666666] hover:text-[#2D2926]"
              >
                Competitor Analysis
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/add-competitor"
              className="hidden rounded-lg bg-[#FFD700] px-3 py-2 text-xs font-bold text-black shadow-sm sm:inline-flex sm:px-4 sm:text-sm"
            >
              Add Competitor
            </Link>
            <button
              type="button"
              className="rounded-full p-2 text-[#2D2926] hover:bg-[#F0EBE3]"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </button>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#E5E0D6] text-xs font-bold text-[#2D2926]">
              JD
            </span>
          </div>
        </div>
        <Link
          href="/add-competitor"
          className="mx-4 mb-3 flex items-center justify-center rounded-lg bg-[#FFD700] py-2.5 text-xs font-bold text-black shadow-sm sm:hidden"
        >
          Add Competitor
        </Link>
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
          {showWelcome ? (
            <div className="flex flex-col items-center px-2 pt-4 text-center sm:pt-8">
              <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD700] shadow-sm">
                <Zap className="size-7 text-black" fill="black" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-bold sm:text-2xl">
                How can I help you today?
              </h1>
              <p className="mt-2 max-w-md text-sm text-[#666666] sm:text-base">
                Query live restaurant data, competitor performance, and market trends in
                real-time.
              </p>
            </div>
          ) : null}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-[#E8E4DC] px-4 py-3 text-left text-sm text-[#2D2926] sm:max-w-[75%] sm:text-[15px]">
                  {m.text}
                </div>
              </div>
            ) : m.role === "typing" ? (
              <div key={m.id} className="flex justify-start">
                <ChatTypingIndicator />
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <AiAnalysisMessage />
              </div>
            ),
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-[#E8E4DC] bg-[#FAFAF7]/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-2xl border border-[#E5E0D6] bg-white py-2 pl-3 pr-2 shadow-md sm:pl-4">
            <FileText className="size-5 shrink-0 text-[#9CA3AF]" aria-hidden />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isAwaitingReply}
              placeholder="How is Bawarchi doing this month?"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2D2926] outline-none placeholder:text-[#9CA3AF] enabled:opacity-100 disabled:opacity-50 sm:text-[15px]"
              aria-label="Message DineIntel AI"
            />
            <button
              type="button"
              onClick={send}
              disabled={isAwaitingReply}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD700] text-black shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Send message"
            >
              <Send className="size-5" strokeWidth={2.2} />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-[11px] text-[#888888] sm:flex-row sm:justify-between">
            <p>DineIntel AI can make mistakes. Verify critical data.</p>
            <p className="font-medium uppercase tracking-wide sm:text-right">
              Model: Intel-v6.2-Pro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
