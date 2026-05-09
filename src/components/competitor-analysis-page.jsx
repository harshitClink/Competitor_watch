"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";
import {
  Bell,
  ChevronDown,
  LayoutGrid,
  Map,
  Menu,
  Minus,
  PieChart,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  bottomCards,
  leaderboardMeta,
  leaderboardRows,
} from "@/mocks/competitor-leaderboard";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const riskStyles = {
  teal: "bg-teal-100 text-teal-900 border-teal-200",
  grey: "bg-zinc-100 text-zinc-700 border-zinc-200",
  watch: "bg-amber-100 text-amber-950 border-amber-300",
};

function DeltaCell({ row }) {
  if (row.deltaDirection === "flat") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500">
        <Minus className="size-4" aria-hidden />
        0.0
      </span>
    );
  }
  const up = row.deltaDirection === "up";
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}
    >
      {up ? (
        <TrendingUp className="size-4" aria-hidden />
      ) : (
        <TrendingDown className="size-4" aria-hidden />
      )}
      {up ? "+" : ""}
      {row.delta}
    </span>
  );
}

function MarketShareGauge({ pct }) {
  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
      <div
        className="absolute flex h-28 w-28 rotate-45 items-center justify-center rounded-lg border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#F5F2E9] to-[#E8E0D0] shadow-inner sm:h-32 sm:w-32"
        aria-hidden
      />
      <div
        className="relative z-[1] flex h-24 w-24 -rotate-45 flex-col items-center justify-center text-center sm:h-28 sm:w-28"
        style={{
          background: `conic-gradient(#5C6B47 0deg ${pct * 3.6}deg, #E8E4DC ${pct * 3.6}deg 360deg)`,
          borderRadius: "12px",
        }}
      >
        <div className="flex h-[88%] w-[88%] flex-col items-center justify-center rounded-lg bg-[#FDF8EE] shadow-sm">
          <span className="text-2xl font-bold text-[#2D2926] sm:text-3xl">{pct}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B47]">
            Pilot
          </span>
        </div>
      </div>
    </div>
  );
}

export function CompetitorAnalysisPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("");

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return leaderboardRows;
    return leaderboardRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q),
    );
  }, [filter]);

  const meta = leaderboardMeta;
  const cards = bottomCards;

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-24 text-[#2D2926]">
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
            <Link
              href="/dashboard"
              className={`${fraunces.className} truncate text-lg font-semibold tracking-tight text-[#5C6B47] sm:text-xl`}
            >
              Daily Digest
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              Daily Digest
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-[#666666] transition-colors hover:text-[#2D2926]"
            >
              AI Chatbot
            </Link>
            <span className="border-b-2 border-[#5C6B47] pb-0.5 text-sm font-semibold text-[#2D2926]">
              Competitor Analysis
            </span>
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
            <span className="flex size-9 items-center justify-center rounded-full bg-[#E5E0D6] text-xs font-bold text-[#2D2926]">
              JD
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 lg:max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
              {meta.portfolioLabel}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              {meta.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-base">
              {meta.subtitle}
            </p>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[#E8D9A8] bg-[#FFD700] p-5 shadow-sm sm:max-w-xs lg:w-80">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2D2926]/80">
              {meta.globalHealth.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-[#2D2926]">
                {meta.globalHealth.value}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {meta.globalHealth.delta}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2D2926]/15">
              <div
                className="h-full rounded-full bg-[#5C6B47]"
                style={{ width: `${meta.globalHealth.progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#EFEBE4] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">{meta.rankingsTitle}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Live
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                {meta.updatedAgo}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter restaurants..."
                  className="w-full rounded-lg border border-[#E0DDD4] bg-[#FAFAF7] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5C6B47]/40 focus:ring-2 focus:ring-[#5C6B47]/20 sm:w-56"
                  aria-label="Filter restaurants"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E0DDD4] bg-white px-4 py-2 text-xs font-semibold text-[#2D2926] hover:bg-[#FAFAF7]"
              >
                Sort
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFEBE4] bg-[#FAFAF7] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
                  <th className="px-4 py-3 sm:px-5">Rank</th>
                  <th className="px-4 py-3 sm:px-5">Restaurant</th>
                  <th className="px-4 py-3 sm:px-5">Health score</th>
                  <th className="px-4 py-3 sm:px-5">Score delta</th>
                  <th className="px-4 py-3 sm:px-5">Headline signal</th>
                  <th className="px-4 py-3 sm:px-5">Risk level</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.rank}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/competitor/${row.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/competitor/${row.slug}`);
                      }
                    }}
                    className="cursor-pointer border-b border-[#F0EBE4] last:border-0 hover:bg-[#FDFBF7]"
                  >
                    <td className="px-4 py-4 font-mono text-sm font-semibold text-[#2D2926] sm:px-5">
                      {row.rank}
                    </td>
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#2D2926]">{row.name}</span>
                        {row.pilot ? (
                          <span className="rounded bg-[#D4AF37] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2D2926]">
                            Pilot
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-[#666666]">{row.location}</p>
                    </td>
                    <td className="px-4 py-4 text-base font-bold sm:px-5">
                      {row.healthScore}
                    </td>
                    <td className="px-4 py-4 sm:px-5">
                      <DeltaCell row={row} />
                    </td>
                    <td className="max-w-xs px-4 py-4 text-[13px] leading-snug text-[#444] sm:px-5">
                      {row.headline}
                    </td>
                    <td className="px-4 py-4 sm:px-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${riskStyles[row.riskVariant]}`}
                      >
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#666666]">
              No restaurants match your filter.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[#EFEBE4] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <p className="text-xs text-[#666666]">
              Showing {filteredRows.length} of {meta.totalEntities} active competitor entities
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-[#E0DDD4] bg-white px-4 py-2 text-xs font-semibold text-[#2D2926] opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#E0DDD4] bg-white px-4 py-2 text-xs font-semibold text-[#2D2926] hover:bg-[#FAFAF7]"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                {cards.marketShare.label}
              </p>
              <PieChart className="size-5 text-[#5C6B47]" aria-hidden />
            </div>
            <MarketShareGauge pct={cards.marketShare.pilotPct} />
            <p className="mt-4 text-center text-xs leading-relaxed text-[#666666]">
              {cards.marketShare.caption}
            </p>
          </article>

          <article className="flex flex-col rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                {cards.riskHeatmap.label}
              </p>
              <Map className="size-5 text-[#5C6B47]" aria-hidden />
            </div>
            <div className="relative aspect-square w-full max-w-[200px] self-center overflow-hidden rounded-xl bg-[#2D2926]">
              <Image
                src={cards.riskHeatmap.image}
                alt=""
                fill
                className="object-cover opacity-70 grayscale"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-[#1a1816]/60" />
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-[#666666]">
              {cards.riskHeatmap.caption}
            </p>
          </article>

          <article className="flex flex-col rounded-2xl border border-[#3D3D3D] bg-[#2A2826] p-5 text-[#F5E6C8] shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
              <LayoutGrid className="size-4" aria-hidden />
              {cards.aiRecommendation.label}
            </div>
            <h3 className="text-lg font-bold text-white">{cards.aiRecommendation.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[#E8DCC8]/90">
              {cards.aiRecommendation.body}
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-[#9A8B4C] py-3 text-xs font-bold uppercase tracking-wide text-[#1A1816] transition-opacity hover:opacity-90"
            >
              {cards.aiRecommendation.cta}
            </button>
          </article>
        </div>
      </main>

      <Link
        href="/add-competitor"
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-[#3D5240] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#5C6B47] focus:ring-offset-2"
        aria-label="Add competitor"
      >
        <Plus className="size-6 stroke-[2.5]" />
      </Link>
    </div>
  );
}
