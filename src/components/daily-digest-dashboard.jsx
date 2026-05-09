"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import {
  Activity,
  ArrowRight,
  Bell,
  Menu,
  Minus,
  Plus,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import {
  aiCta,
  competitorActivity,
  executiveBriefing,
  pricingVolatilityData,
} from "@/mocks/daily-digest";

const DashboardPricingChart = dynamic(
  () =>
    import("@/components/dashboard-pricing-chart").then(
      (m) => m.DashboardPricingChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] w-full min-w-0 animate-pulse rounded-lg bg-[#F0EBE3] sm:h-[260px]" />
    ),
  },
);

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const accentBorder = {
  red: "border-l-red-600",
  amber: "border-l-amber-500",
  zinc: "border-l-zinc-400",
};

const statusTone = {
  red: "text-red-700",
  amber: "text-amber-800",
  zinc: "text-zinc-600",
};

function StatusIcon({ type }) {
  if (type === "trend-down") {
    return <TrendingDown className="size-3.5 text-red-600" aria-hidden />;
  }
  if (type === "activity") {
    return <Activity className="size-3.5 text-amber-600" aria-hidden />;
  }
  return <Minus className="size-3.5 text-zinc-500" aria-hidden />;
}

export function DailyDigestDashboard() {
  return (
    <div className="min-h-screen bg-[#FDF8EE] pb-24 text-[#2D2926]">
      <header className="sticky top-0 z-40 border-b border-[#E8E4DC] bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-[#2D2926] hover:bg-[#F0EBE3]"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span
              className={`${fraunces.className} text-lg font-semibold tracking-tight text-[#5C6B47] sm:text-xl`}
            >
              Daily Digest
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            <span className="border-b-2 border-[#5C6B47] pb-0.5 text-sm font-semibold text-[#2D2926]">
              Daily Digest
            </span>
            <Link
              href="/chat"
              className="text-sm font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              AI Chatbot
            </Link>
            <Link
              href="/competitor-analysis"
              className="text-sm font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              Competitor Analysis
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/add-competitor"
              className="hidden rounded-lg bg-[#5C6B47] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:inline-flex sm:px-4 sm:text-sm"
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
            <span
              className="flex size-9 items-center justify-center rounded-full bg-[#E5E0D6] text-xs font-bold text-[#2D2926]"
              aria-hidden
            >
              JD
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
              <Zap className="size-3.5 text-amber-500" aria-hidden />
              Executive briefing
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight sm:text-2xl">
              {executiveBriefing.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-[15px]">
              {executiveBriefing.body}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#EFEBE4] pt-5 sm:grid-cols-3">
              {executiveBriefing.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
                    {m.label}
                  </p>
                  <p className={`mt-1 text-base font-bold sm:text-lg ${m.valueClass}`}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-between rounded-2xl bg-[#5C6B47] p-6 text-white shadow-sm sm:p-7">
            <div>
              <Sparkles className="size-8 text-white/90" aria-hidden />
              <h2 className="mt-4 text-xl font-bold">{aiCta.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                {aiCta.subtitle}
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-[#5C6B47] shadow-sm transition-opacity hover:opacity-95"
            >
              {aiCta.buttonLabel}
            </Link>
          </section>
        </div>

        <section className="mt-8 lg:mt-10">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Recent Competitor Activity</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
              Last updated: 5m ago
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {competitorActivity.map((row) => (
              <Link
                key={row.id}
                href={`/competitor/${row.detailSlug}`}
                className={`block overflow-hidden rounded-2xl border border-[#E5E0D6] border-l-4 bg-white shadow-sm transition-opacity hover:opacity-[0.98] ${accentBorder[row.accent]}`}
              >
                <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                      Competitor
                    </p>
                    <p className="mt-1 font-bold text-[#2D2926]">{row.competitor}</p>
                    <p
                      className={`mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${statusTone[row.accent]}`}
                    >
                      <StatusIcon type={row.statusIcon} />
                      {row.statusLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                      What changed
                    </p>
                    <p className="mt-1 font-bold text-[#2D2926]">{row.whatChangedTitle}</p>
                    <p className="mt-1 text-sm text-[#666666]">{row.whatChangedBody}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                      Why it matters
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#666666]">
                      {row.whyItMatters}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                      Suggested response
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${row.responseBadgeClass}`}
                    >
                      {row.responseBadge}
                    </span>
                    <p className="mt-2 text-xs italic text-[#666666]">{row.responseNote}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-4 lg:gap-6">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-4 shadow-sm lg:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
              Competitor saturation
            </p>
            <div className="relative mt-3 aspect-square overflow-hidden rounded-xl bg-[#2D2926] sm:aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=60"
                alt=""
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 1024px) 100vw, 280px"
              />
              <div className="absolute inset-0 bg-[#2D2926]/50" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <button
                  type="button"
                  className="rounded-xl bg-[#5C6B47] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                >
                  View Heatmap
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-lg font-bold sm:text-xl">Pricing Volatility Index</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#2D2926]">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#6B7C4E]" />
                  You
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#B84A4A]" />
                  Bawarchi
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <DashboardPricingChart data={pricingVolatilityData} />
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-[#EFEBE4] pt-4 text-xs text-[#888888] sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl leading-relaxed">
                Data synthesized from 24 sources including UberEats, Yelp, and DoorDash
                API.
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-1 font-semibold text-[#5C6B47] hover:underline"
              >
                Full Report
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Link
        href="/add-competitor"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#FFD700] text-[#2D2926] shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#5C6B47] focus:ring-offset-2"
        aria-label="Add or manage competitors"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </Link>
    </div>
  );
}
