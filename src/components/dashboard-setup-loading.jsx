"use client";

import { BarChart3, Loader2 } from "lucide-react";

/**
 * Simple full-screen loading overlay while a real API request runs.
 */
export function DashboardSetupLoading({ open, message = "Creating your dashboard…" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 10% 0%, #FFFCF5 0%, #F5F0E6 45%, #EDE8DE 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-loading-title"
      aria-busy="true"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-[#FFD700] shadow-sm sm:size-10">
            <BarChart3 className="size-5 text-white sm:size-6" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-lg font-bold text-[#2D2926] sm:text-xl">DineIntel</span>
        </div>

        <Loader2
          className="mt-10 size-12 animate-spin text-[#B8860B] sm:size-14"
          aria-hidden
        />

        <h1
          id="setup-loading-title"
          className="mt-8 text-xl font-bold text-[#B8860B] sm:text-2xl"
        >
          Setting up
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{message}</p>
      </div>
    </div>
  );
}
