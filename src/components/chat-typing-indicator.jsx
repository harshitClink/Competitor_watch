import { Crown } from "lucide-react";

export function ChatTypingIndicator() {
  return (
    <div className="flex w-full max-w-[min(100%,42rem)] gap-3 sm:gap-4">
      <div
        className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#3D2E26] sm:size-10"
        aria-hidden
      >
        <Crown className="size-4 text-[#D4AF37]/70 sm:size-5" strokeWidth={1.75} />
      </div>
      <div
        className="rounded-2xl border border-[#E5E0D6] bg-white px-5 py-4 shadow-sm"
        role="status"
        aria-label="Assistant is typing"
      >
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="chat-typing-dot size-2 rounded-full bg-[#6B7280]" />
          <span className="chat-typing-dot size-2 rounded-full bg-[#6B7280]" />
          <span className="chat-typing-dot size-2 rounded-full bg-[#6B7280]" />
        </div>
      </div>
    </div>
  );
}
