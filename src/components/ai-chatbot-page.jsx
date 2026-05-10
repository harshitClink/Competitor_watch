"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { useRouter } from "next/navigation";
import { Bell, FileText, Send, Zap } from "lucide-react";
import {
  createChatSession,
  getChatMessages,
  getChatSession,
  getCurrentPilot,
  sendChatMessage,
  setStoredChatSessionId,
  setStoredPilotRestaurantId,
  getStoredChatSessionId,
} from "@/lib/api";
import { AiAnalysisMessage } from "@/components/ai-analysis-message";
import { ApiLoader } from "@/components/api-loading";
import { ChatTypingIndicator } from "@/components/chat-typing-indicator";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AiChatbotPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [lastModel, setLastModel] = useState(null);
  const [chatInitializing, setChatInitializing] = useState(true);
  const listRef = useRef(null);

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
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const pilot = await getCurrentPilot();
        const pr = pilot?.pilot_restaurant;
        if (!pr?.id) {
          router.replace("/");
          return;
        }
        setStoredPilotRestaurantId(pr.id);

        let sid = getStoredChatSessionId();
        if (sid != null) {
          try {
            const s = await getChatSession(sid);
            if (s?.chat_session?.pilot_restaurant_id !== pr.id) {
              sid = null;
            }
          } catch {
            sid = null;
          }
        }

        if (sid == null) {
          const created = await createChatSession(pr.id);
          const newId = created?.chat_session?.id;
          if (newId != null) {
            setStoredChatSessionId(newId);
            sid = newId;
          }
        }

        if (cancelled) return;
        setSessionId(sid);

        if (sid != null) {
          const transcript = await getChatMessages(sid);
          const list = transcript?.messages ?? [];
          if (!cancelled) {
            setMessages(list);
            const lastAssistant = [...list].reverse().find((m) => m.role === "assistant");
            setLastModel(lastAssistant?.model_version ?? null);
          }
        }
      } catch (e) {
        if (!cancelled) {
          if (e.status === 404) router.replace("/");
          else setLoadError(e.message || "Could not start chat");
        }
      } finally {
        if (!cancelled) setChatInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isAwaitingReply || sessionId == null) return;

    setInput("");
    const typingId = createId();
    const userMsgId = createId();
    setIsAwaitingReply(true);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: text, created_at: new Date().toISOString() },
      { id: typingId, role: "typing" },
    ]);

    try {
      const data = await sendChatMessage(sessionId, text);
      const am = data?.assistant_message;
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== typingId);
        if (!am) return withoutTyping;
        return [
          ...withoutTyping,
          {
            id: am.id,
            role: "assistant",
            content: am.content,
            citations: am.citations,
            model_version: am.model_version,
            created_at: am.created_at,
          },
        ];
      });
      if (am?.model_version) setLastModel(am.model_version);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Error: ${e.message || "Request failed"}`,
          model_version: null,
        },
      ]);
    } finally {
      setIsAwaitingReply(false);
    }
  }, [input, isAwaitingReply, sessionId]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const showWelcome =
    messages.length === 0 && !loadError && !chatInitializing;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#FDF8EE] text-[#2D2926]">
      <header className="z-40 shrink-0 border-b border-[#E8E4DC] bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 justify-start">
            <Link
              href="/dashboard"
              className={`${fraunces.className} text-lg font-semibold tracking-tight text-[#5C6B47] sm:text-xl`}
            >
              DineIntel
            </Link>
          </div>

          <nav
            className="flex items-center gap-4 overflow-x-auto text-sm sm:gap-8"
            aria-label="Main"
          >
            <Link
              href="/dashboard"
              className="whitespace-nowrap font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              Daily Digest
            </Link>
            <span className="whitespace-nowrap border-b-2 border-[#5C6B47] pb-0.5 font-semibold text-[#2D2926]">
              AI Chatbot
            </span>
            <Link
              href="/competitor-analysis"
              className="whitespace-nowrap font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              Competitor Analysis
            </Link>
          </nav>

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
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
          </div>
        </div>
        <Link
          href="/add-competitor"
          className="mx-4 mb-3 flex items-center justify-center rounded-lg bg-[#FFD700] py-2.5 text-xs font-bold text-black shadow-sm sm:hidden"
        >
          Add Competitor
        </Link>
      </header>

      {loadError ? (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          {loadError}
        </div>
      ) : null}

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
          {chatInitializing && !loadError ? (
            <ApiLoader message="Connecting to chat…" size="page" className="min-h-[40vh]" />
          ) : null}
          {showWelcome ? (
            <div className="flex flex-col items-center px-2 pt-4 text-center sm:pt-8">
              <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD700] shadow-sm">
                <Zap className="size-7 text-black" fill="black" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-bold sm:text-2xl">
                How can I help you today?
              </h1>
              <p className="mt-2 max-w-md text-sm text-[#666666] sm:text-base">
                Ask questions about your pilot restaurant and tracked competitors. Replies use
                live API data on the backend.
              </p>
            </div>
          ) : null}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-[#E8E4DC] px-4 py-3 text-left text-sm text-[#2D2926] sm:max-w-[75%] sm:text-[15px]">
                  {m.content}
                </div>
              </div>
            ) : m.role === "typing" ? (
              <div key={m.id} className="flex justify-start">
                <ChatTypingIndicator />
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <AiAnalysisMessage
                  content={m.content}
                  citations={m.citations}
                  modelVersion={m.model_version}
                />
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
              disabled={isAwaitingReply || sessionId == null || chatInitializing}
              placeholder="Ask about pricing, menus, or competitors…"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2D2926] outline-none placeholder:text-[#9CA3AF] enabled:opacity-100 disabled:opacity-50 sm:text-[15px]"
              aria-label="Message DineIntel AI"
            />
            <button
              type="button"
              onClick={send}
              disabled={isAwaitingReply || sessionId == null || chatInitializing}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD700] text-black shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Send message"
            >
              <Send className="size-5" strokeWidth={2.2} />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-[11px] text-[#888888] sm:flex-row sm:justify-between">
            <p>DineIntel AI can make mistakes. Verify critical data.</p>
            {lastModel ? (
              <p className="font-medium uppercase tracking-wide sm:text-right">
                Model: {lastModel}
              </p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
