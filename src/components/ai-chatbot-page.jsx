"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  MessageSquare,
  Plus,
  Send,
  X,
  Zap,
} from "lucide-react";
import {
  clearStoredChatSessionId,
  createChatSession,
  getChatMessages,
  getChatSession,
  getCurrentPilot,
  getSuggestedQuestions,
  listChatSessions,
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

/** @param {{ id: number, last_message_at?: string|null, started_at?: string|null }[]} list */
function sortChatSessions(list) {
  return list.slice().sort((a, b) => {
    const ta = Date.parse(a.last_message_at || a.started_at || "") || 0;
    const tb = Date.parse(b.last_message_at || b.started_at || "") || 0;
    return tb - ta;
  });
}

function titleFromFirstUserMessage(text) {
  const t = text.trim();
  if (!t) return "New chat";
  return t.length > 120 ? `${t.slice(0, 117)}…` : t;
}

/**
 * @param {{
 *   sessions: Array<{ id: number, title?: string|null, message_count?: number, last_message_at?: string|null, started_at?: string|null }>,
 *   activeId: number | null,
 *   onSelect: (id: number) => void,
 *   onNew: () => void,
 * }} props
 */
function ChatHistoryPanel({ sessions, activeId, onSelect, onNew }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#E8E4DC] p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-95"
        >
          <Plus className="size-4" aria-hidden />
          New chat
        </button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Chat history">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wide text-[#888888]">
          History
        </p>
        {sessions.length === 0 ? (
          <p className="px-2 py-4 text-sm leading-relaxed text-[#666666]">
            No conversations yet. Start a new chat and your first message becomes the title.
          </p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => {
              const label =
                s.title != null && String(s.title).trim() !== ""
                  ? String(s.title).trim()
                  : `Chat · ${s.id}`;
              const isActive = activeId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-[#E8E4DC] ring-1 ring-[#C4BFB2]"
                        : "hover:bg-[#F0EBE3]"
                    }`}
                  >
                    <span className="line-clamp-2 text-sm font-semibold text-[#2D2926]">
                      {label}
                    </span>
                    <span className="text-[10px] text-[#888888]">
                      {s.message_count ?? 0}{" "}
                      {(s.message_count ?? 0) === 1 ? "message" : "messages"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}

export function AiChatbotPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [pilotRecordId, setPilotRecordId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [sessionSwitching, setSessionSwitching] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [chatInitializing, setChatInitializing] = useState(true);
  const [suggestedData, setSuggestedData] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [suggestionPhase, setSuggestionPhase] = useState("categories");
  const [pickedCategory, setPickedCategory] = useState(null);
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

  const refreshSessions = useCallback(async (pilotId) => {
    if (pilotId == null) return;
    try {
      const data = await listChatSessions(pilotId);
      setSessions(sortChatSessions(data?.chat_sessions ?? []));
    } catch {
      setSessions([]);
    }
  }, []);

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
        if (!cancelled) setPilotRecordId(pr.id);

        const listData = await listChatSessions(pr.id);
        if (!cancelled) {
          setSessions(sortChatSessions(listData?.chat_sessions ?? []));
        }

        let sid = getStoredChatSessionId();
        if (sid != null) {
          try {
            const s = await getChatSession(sid);
            if (s?.chat_session?.pilot_restaurant_id !== pr.id) {
              sid = null;
              clearStoredChatSessionId();
            }
          } catch {
            sid = null;
            clearStoredChatSessionId();
          }
        }

        if (cancelled) return;
        setSessionId(sid);

        if (sid != null) {
          const transcript = await getChatMessages(sid);
          const list = transcript?.messages ?? [];
          if (!cancelled) setMessages(list);
        } else {
          if (!cancelled) setMessages([]);
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

  useEffect(() => {
    if (pilotRecordId == null) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      try {
        const data = await getSuggestedQuestions(pilotRecordId);
        if (!cancelled) setSuggestedData(data);
      } catch (e) {
        if (!cancelled) {
          setSuggestedData(null);
          setSuggestionsError(
            e.message || "Could not load suggested questions",
          );
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pilotRecordId]);

  const startNewChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    clearStoredChatSessionId();
    setHistoryOpen(false);
    setSuggestionPhase("categories");
    setPickedCategory(null);
  }, []);

  const selectSession = useCallback(
    async (id) => {
      if (id === sessionId) {
        setHistoryOpen(false);
        return;
      }
      setHistoryOpen(false);
      setSessionSwitching(true);
      setLoadError(null);
      setMessages([]);
      try {
        const transcript = await getChatMessages(id);
        setSessionId(id);
        setStoredChatSessionId(id);
        setMessages(transcript?.messages ?? []);
        if (pilotRecordId != null) await refreshSessions(pilotRecordId);
      } catch (e) {
        setLoadError(e.message || "Could not load conversation");
        clearStoredChatSessionId();
        setSessionId(null);
        setMessages([]);
      } finally {
        setSessionSwitching(false);
      }
    },
    [sessionId, pilotRecordId, refreshSessions],
  );

  const sendMessage = useCallback(
    async (explicitText) => {
      const text =
        explicitText != null && String(explicitText).trim() !== ""
          ? String(explicitText).trim()
          : input.trim();
      if (!text || isAwaitingReply || chatInitializing || pilotRecordId == null)
        return;

      setInput("");
      const typingId = createId();
      const userMsgId = createId();
      setIsAwaitingReply(true);

      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
        },
        { id: typingId, role: "typing" },
      ]);

      let activeSessionId = sessionId;
      try {
        if (activeSessionId == null) {
          const created = await createChatSession(
            pilotRecordId,
            titleFromFirstUserMessage(text),
          );
          activeSessionId = created?.chat_session?.id ?? null;
          if (activeSessionId == null) {
            throw new Error("Could not create chat session");
          }
          setSessionId(activeSessionId);
          setStoredChatSessionId(activeSessionId);
          await refreshSessions(pilotRecordId);
        }

        const data = await sendChatMessage(activeSessionId, text);
        const um = data?.user_message;
        const am = data?.assistant_message;
        setMessages((prev) => {
          const withoutTyping = prev.filter((m) => m.id !== typingId);
          const withoutOptimisticUser = withoutTyping.filter(
            (m) => m.id !== userMsgId,
          );
          const next = [...withoutOptimisticUser];
          if (um) {
            next.push({
              id: um.id,
              role: "user",
              content: um.content,
              citations: um.citations,
              created_at: um.created_at,
            });
          }
          if (am) {
            next.push({
              id: am.id,
              role: "assistant",
              content: am.content,
              citations: am.citations,
              created_at: am.created_at,
            });
          }
          return next;
        });
        await refreshSessions(pilotRecordId);
      } catch (e) {
        setMessages((prev) => {
          const withoutTyping = prev.filter((m) => m.id !== typingId);
          const withoutOptimisticUser = withoutTyping.filter(
            (m) => m.id !== userMsgId,
          );
          return [
            ...withoutOptimisticUser,
            {
              id: createId(),
              role: "assistant",
              content: `Error: ${e.message || "Request failed"}`,
            },
          ];
        });
      } finally {
        setIsAwaitingReply(false);
      }
    },
    [
      input,
      isAwaitingReply,
      sessionId,
      chatInitializing,
      pilotRecordId,
      refreshSessions,
    ],
  );

  const send = useCallback(() => {
    return sendMessage();
  }, [sendMessage]);

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
    messages.length === 0 &&
    sessionId == null &&
    !loadError &&
    !chatInitializing &&
    !sessionSwitching;

  const inputDisabled =
    isAwaitingReply ||
    pilotRecordId == null ||
    chatInitializing ||
    sessionSwitching;

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

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[#5C6B47] hover:bg-[#F0EBE3] lg:hidden"
              aria-label="Open chat history"
            >
              <MessageSquare className="size-5" aria-hidden />
              <span className="hidden sm:inline">Chats</span>
            </button>
            <Link
              href="/add-competitor"
              className="hidden rounded-lg bg-[#FFD700] px-3 py-2 text-xs font-bold text-black shadow-sm sm:inline-flex sm:px-4 sm:text-sm"
            >
              Add Competitor
            </Link>
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

      <div className="flex min-h-0 flex-1">
        <aside className="hidden min-h-0 w-[280px] shrink-0 flex-col border-r border-[#E8E4DC] bg-[#FAFAF7] lg:flex">
          <ChatHistoryPanel
            sessions={sessions}
            activeId={sessionId}
            onSelect={selectSession}
            onNew={startNewChat}
          />
        </aside>

        {historyOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close chat history"
              onClick={() => setHistoryOpen(false)}
            />
            <aside className="absolute bottom-0 left-0 top-0 flex w-[min(100vw-2.5rem,300px)] flex-col border-r border-[#E8E4DC] bg-[#FAFAF7] shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] px-3 py-2">
                <span className="text-sm font-bold text-[#2D2926]">Chats</span>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="rounded-lg p-2 text-[#2D2926] hover:bg-[#F0EBE3]"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <ChatHistoryPanel
                  sessions={sessions}
                  activeId={sessionId}
                  onSelect={selectSession}
                  onNew={startNewChat}
                />
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
              {chatInitializing && !loadError ? (
                <ApiLoader
                  message="Connecting to chat…"
                  size="page"
                  className="min-h-[40vh]"
                />
              ) : null}
              {sessionSwitching ? (
                <ApiLoader
                  message="Loading conversation…"
                  size="section"
                  className="min-h-[30vh]"
                />
              ) : null}
              {showWelcome ? (
                <div className="flex w-full flex-col items-center px-2 pt-4 sm:pt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD700] shadow-sm">
                      <Zap className="size-7 text-black" fill="black" aria-hidden />
                    </div>
                    <h1 className="mt-5 text-xl font-bold sm:text-2xl">
                      How can I help you today?
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-[#666666] sm:text-base">
                      Ask questions about your pilot restaurant and tracked competitors.
                    </p>
                    {suggestedData?.pilot_name ? (
                      <p className="mt-3 max-w-md text-xs text-[#888888]">
                        <span className="font-semibold text-[#666666]">
                          {suggestedData.pilot_name}
                        </span>
                        {suggestedData.competitor_count != null ? (
                          <>
                            {" "}
                            · {suggestedData.competitor_count} competitors in your set
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-8 w-full max-w-2xl text-left">
                    {suggestionsLoading ? (
                      <ApiLoader
                        message="Loading suggestions…"
                        size="compact"
                        className="py-8"
                      />
                    ) : null}
                    {suggestionsError && !suggestionsLoading ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {suggestionsError}
                      </p>
                    ) : null}
                    {suggestedData && !suggestionsLoading ? (
                      <div className="flex flex-col gap-8">
                        {suggestionPhase === "categories" &&
                        suggestedData.starter_chips &&
                        suggestedData.starter_chips.length > 0 ? (
                          <section aria-label="Quick starts">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                              Quick starts
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {suggestedData.starter_chips.map((q) => (
                                <button
                                  key={q}
                                  type="button"
                                  disabled={inputDisabled}
                                  onClick={() => sendMessage(q)}
                                  className="rounded-full border border-[#D4CFC4] bg-white px-3 py-2 text-left text-xs font-medium leading-snug text-[#2D2926] shadow-sm transition-colors hover:border-[#5C6B47]/50 hover:bg-[#FAFAF7] disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {suggestionPhase === "categories" ? (
                          <section aria-label="Browse by topic">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                              Browse by topic
                            </p>
                            <p className="mt-1 text-xs text-[#666666]">
                              Pick a category, then choose a question to send.
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {(suggestedData.categories ?? []).map((cat) => (
                                <button
                                  key={cat.name}
                                  type="button"
                                  onClick={() => {
                                    setPickedCategory(cat);
                                    setSuggestionPhase("questions");
                                  }}
                                  className="flex flex-col rounded-2xl border border-[#E5E0D6] bg-white p-4 text-left shadow-sm transition-all hover:border-[#5C6B47]/40 hover:ring-2 hover:ring-[#5C6B47]/15"
                                >
                                  <span className="text-base font-bold text-[#2D2926]">
                                    {cat.label}
                                  </span>
                                  <span className="mt-2 text-xs text-[#888888]">
                                    {(cat.questions ?? []).length} suggested questions
                                  </span>
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : pickedCategory ? (
                          <section aria-label="Suggested questions">
                            <button
                              type="button"
                              onClick={() => {
                                setSuggestionPhase("categories");
                                setPickedCategory(null);
                              }}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-[#5C6B47] hover:underline"
                            >
                              <ChevronLeft className="size-4" aria-hidden />
                              All topics
                            </button>
                            <h2 className="mt-3 text-lg font-bold text-[#2D2926]">
                              {pickedCategory.label}
                            </h2>
                            <ul className="mt-4 flex flex-col gap-2">
                              {(pickedCategory.questions ?? []).map((q, idx) => (
                                <li key={`${pickedCategory.name}-${idx}`}>
                                  <button
                                    type="button"
                                    disabled={inputDisabled}
                                    onClick={() => sendMessage(q)}
                                    className="w-full rounded-xl border border-[#E5E0D6] bg-white px-4 py-3 text-left text-sm leading-relaxed text-[#2D2926] shadow-sm transition-colors hover:border-[#5C6B47]/35 hover:bg-[#FAFAF7] disabled:cursor-not-allowed disabled:opacity-45"
                                  >
                                    {q}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {!sessionSwitching
                ? messages.map((m) =>
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
                        />
                      </div>
                    ),
                  )
                : null}
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
                  disabled={inputDisabled}
                  placeholder="Ask about pricing, menus, or competitors…"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2D2926] outline-none placeholder:text-[#9CA3AF] enabled:opacity-100 disabled:opacity-50 sm:text-[15px]"
                  aria-label="Message DineIntel AI"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={inputDisabled}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD700] text-black shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Send message"
                >
                  <Send className="size-5" strokeWidth={2.2} />
                </button>
              </div>
              <div className="mt-3 text-[11px] text-[#888888]">
                <p>DineIntel AI can make mistakes. Verify critical data.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
