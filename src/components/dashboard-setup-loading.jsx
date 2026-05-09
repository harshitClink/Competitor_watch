"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Check, Hourglass, RefreshCw } from "lucide-react";

const STEP_MS = 2000;
const TOTAL_STEPS = 4;

const STEP_COPY = [
  {
    description: "Analyzing competitor menus...",
  },
  {
    description: "Gathering sentiment data...",
  },
  {
    description: "Building your intelligence feed...",
  },
  {
    description: "Finalizing your dashboard...",
  },
];

function cardStatus(index, phase) {
  if (phase > index) return "success";
  if (phase === index && phase < TOTAL_STEPS) return "processing";
  return "queued";
}

function StepCard({ status, description }) {
  const isSuccess = status === "success";
  const isProcessing = status === "processing";
  const isQueued = status === "queued";

  return (
    <div
      className={`flex flex-col rounded-xl border-2 px-4 py-4 text-center transition-all duration-500 sm:px-5 sm:py-5 ${
        isSuccess
          ? "border-transparent bg-[#E8DCC8] text-[#3D2E26]"
          : isProcessing
            ? "border-[#FFD700] bg-[#F0E6D4] text-[#3D2E26] shadow-[0_0_0_1px_rgba(255,215,0,0.35)]"
            : "border-transparent bg-[#F5F0E6]/80 text-[#3D2E26]/45"
      }`}
    >
      <div className="mb-3 flex justify-center">
        {isSuccess ? (
          <span className="flex size-10 items-center justify-center rounded-full bg-[#5C6B47] text-white">
            <Check className="size-5" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}
        {isProcessing ? (
          <span className="flex size-10 items-center justify-center rounded-full bg-[#FFD700]/40 text-[#3D2E26]">
            <RefreshCw className="size-5 animate-spin" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
        {isQueued ? (
          <span className="flex size-10 items-center justify-center rounded-full bg-[#E0D8CC]/80 text-[#3D2E26]/40">
            <Hourglass className="size-5" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] sm:text-xs">
        {isSuccess ? "Success" : isProcessing ? "Processing" : "Queued"}
      </p>
      <p
        className={`mt-2 text-xs leading-snug sm:text-sm ${
          isQueued ? "text-[#3D2E26]/50" : "text-[#3D2E26]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export function DashboardSetupLoading({ open, onComplete }) {
  const [phase, setPhase] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!open) return;

    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      if (current >= TOTAL_STEPS) {
        window.clearInterval(id);
        setPhase(TOTAL_STEPS);
        onCompleteRef.current();
        return;
      }
      setPhase(current);
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const progressPct = Math.min(100, (phase / TOTAL_STEPS) * 100);

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
      <div className="flex w-full max-w-3xl flex-col items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-[#FFD700] shadow-sm sm:size-10">
            <BarChart3 className="size-5 text-white sm:size-6" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-lg font-bold text-[#2D2926] sm:text-xl">DineIntel</span>
        </div>

        <div className="relative mt-10 flex size-20 items-center justify-center sm:size-24">
          <svg
            className="setup-arc-spin absolute size-full origin-center text-[#FFD700]"
            viewBox="0 0 64 64"
            aria-hidden
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="44 132"
            />
          </svg>
          <span className="relative z-[1] flex size-9 items-center justify-center rounded-full bg-[#3D2E26]/90 text-white sm:size-10">
            <span className="text-sm font-bold sm:text-base" aria-hidden>
              i
            </span>
          </span>
        </div>

        <h1
          id="setup-loading-title"
          className="mt-8 text-xl font-bold text-[#B8860B] sm:text-2xl"
        >
          Assembling Command Center
        </h1>

        <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-[#E0D8CC]">
          <div
            className="h-full rounded-full bg-[#FFD700] transition-[width] duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {STEP_COPY.map((step, i) => (
            <StepCard
              key={i}
              status={cardStatus(i, phase)}
              description={step.description}
            />
          ))}
        </div>

        <p className="mt-10 max-w-lg text-center text-xs leading-relaxed text-[#6B7280] sm:text-sm">
          Initial synchronization usually takes 15–20 seconds. We&apos;re cross-referencing
          regional pricing and social engagement metrics.
        </p>
      </div>
    </div>
  );
}
