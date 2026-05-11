"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/** @typedef {"digest" | "chat" | "analysis" | null} AppNavActive */

const MD = 768;

/**
 * Slide-out main navigation for viewports below `md`.
 * @param {{ open: boolean, onClose: () => void, active?: AppNavActive, addButtonVariant?: "green" | "gold" }} props
 */
export function MobileAppNavDrawer({
  open,
  onClose,
  active = null,
  addButtonVariant = "green",
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${MD}px)`);
    const onChange = () => {
      if (mq.matches) onClose();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, onClose]);

  if (!open) return null;

  const itemClass = (isActive) =>
    `rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
      isActive
        ? "bg-[#E8E4DC] text-[#2D2926] ring-1 ring-[#C4BFB2]"
        : "text-[#444] hover:bg-[#F0EBE3]"
    }`;

  return (
    <div
      className="fixed inset-0 z-[100] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute bottom-0 left-0 top-0 flex w-[min(88vw,300px)] max-w-full flex-col border-r border-[#E8E4DC] bg-[#FAFAF7] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E4DC] px-4 py-3.5">
          <span className="text-sm font-bold text-[#2D2926]">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#2D2926] hover:bg-[#F0EBE3]"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={itemClass(active === "digest")}
          >
            Daily Digest
          </Link>
          <Link
            href="/chat"
            onClick={onClose}
            className={itemClass(active === "chat")}
          >
            AI Chatbot
          </Link>
          <Link
            href="/competitor-analysis"
            onClick={onClose}
            className={itemClass(active === "analysis")}
          >
            Competitor Analysis
          </Link>
        </nav>
        <div className="shrink-0 border-t border-[#E8E4DC] p-3">
          <Link
            href="/add-competitor"
            onClick={onClose}
            className={
              addButtonVariant === "gold"
                ? "flex w-full items-center justify-center rounded-xl bg-[#FFD700] py-3 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-95"
                : "flex w-full items-center justify-center rounded-xl bg-[#5C6B47] py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
            }
          >
            Add Competitor
          </Link>
        </div>
      </aside>
    </div>
  );
}
