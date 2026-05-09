"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import {
  ArrowLeft,
  Bell,
  Building2,
  Megaphone,
  Radio,
  FileDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  getCompetitorDetailHeader,
  intelligenceSignals,
  menuActivity,
  priceBandFooter,
  priceBands,
  ratingSummary,
  ratingTrendData,
  threatAssessment,
} from "@/mocks/competitor-detail";
import { ExportPdfModal } from "@/components/export-pdf-modal";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const CompetitorDetailChart = dynamic(
  () =>
    import("@/components/competitor-detail-chart").then(
      (m) => m.CompetitorDetailChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-lg bg-[#F0EBE3] sm:h-[220px]" />
    ),
  },
);

const signalIconWrap = {
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-800",
};

function SignalIcon({ type }) {
  if (type === "blue") {
    return <Megaphone className="size-5" aria-hidden />;
  }
  if (type === "red") {
    return <Radio className="size-5" aria-hidden />;
  }
  return <Building2 className="size-5" aria-hidden />;
}

export function CompetitorDetailPage({ slug }) {
  const header = useMemo(() => getCompetitorDetailHeader(slug), [slug]);
  const [feedFilter, setFeedFilter] = useState("all");
  const [exportPdfOpen, setExportPdfOpen] = useState(false);

  const filteredSignals = useMemo(() => {
    if (feedFilter === "all") return intelligenceSignals;
    return intelligenceSignals.filter((s) => s.filter === feedFilter);
  }, [feedFilter]);

  const badgeClass =
    header.badge === "PILOT"
      ? "bg-[#5C6B47] text-white"
      : header.badge === "DEFEND"
        ? "bg-red-600 text-white"
        : header.badge === "WATCH"
          ? "bg-amber-500 text-black"
          : header.badge === "HOLD" || header.badge === "IGNORE"
            ? "bg-zinc-500 text-white"
            : "bg-red-600 text-white";

  return (
    <div className="min-h-screen bg-[#FDF8EE] pb-16 text-[#2D2926]">
      <ExportPdfModal open={exportPdfOpen} onClose={() => setExportPdfOpen(false)} />
      <div className="border-b border-[#E8E4DC] bg-[#FAFAF7]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/competitor-analysis"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#5C6B47] hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666]">
          <Link href="/competitors" className="hover:text-[#2D2926]">
            Competitors
          </Link>
          <span className="mx-2 text-[#C4BFB2]" aria-hidden>
            &gt;
          </span>
          <span className="text-[#2D2926]">{header.breadcrumbName}</span>
        </nav>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className={`${fraunces.className} text-3xl font-bold tracking-tight sm:text-4xl`}
              >
                {header.title}
              </h1>
              <span
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
              >
                {header.badge}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#666666] sm:text-base">{header.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <button
              type="button"
              onClick={() => setExportPdfOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E0DDD4] bg-white px-4 py-2.5 text-sm font-semibold text-[#2D2926] shadow-sm hover:bg-[#FAFAF7]"
            >
              <FileDown className="size-4" aria-hidden />
              Export PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-bold text-black shadow-sm hover:opacity-95"
            >
              <Bell className="size-4" aria-hidden />
              Set Alert
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">Threat assessment</h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">
                {threatAssessment.overlapPct}
              </span>
              <span className="text-xs font-semibold text-red-600">
                {threatAssessment.overlapDelta}
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              {threatAssessment.metrics.map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-[#666666]">
                    <span>{m.label}</span>
                    <span className="text-[#2D2926]">{m.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EFEBE4]">
                    <div
                      className="h-full rounded-full bg-[#5C6B47]"
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[#E8E4DC] bg-[#FAFAF7] p-4 text-sm leading-relaxed text-[#444]">
              {threatAssessment.insight}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Rating &amp; sentiment trend
            </h2>
            <div className="mt-4 min-w-0">
              <CompetitorDetailChart
                data={ratingTrendData}
                competitorSeriesName={header.title}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  {ratingSummary.sentiment.label}
                </p>
                <p className="mt-1 text-sm font-bold text-teal-700">
                  {ratingSummary.sentiment.value}
                </p>
                <p className="text-xs text-[#666666]">{ratingSummary.sentiment.sub}</p>
              </div>
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  {ratingSummary.reviewVolume.label}
                </p>
                <p className="mt-1 text-sm font-bold">{ratingSummary.reviewVolume.value}</p>
                <p
                  className={`text-xs font-semibold ${ratingSummary.reviewVolume.deltaClass}`}
                >
                  {ratingSummary.reviewVolume.delta}
                </p>
              </div>
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  {ratingSummary.avgRating.label}
                </p>
                <p className="mt-1 text-sm font-bold">{ratingSummary.avgRating.value}</p>
                <p className="text-xs text-[#666666]">{ratingSummary.avgRating.sub}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Menu activity (last 30 days)
            </h2>
            <ul className="mt-4 flex flex-col divide-y divide-[#EFEBE4]">
              {menuActivity.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-4 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#2D2926]">{item.name}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#888888]">
                        {item.status} • {item.date}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${item.tagClass}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#2D2926]">{item.priceLine}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">Price band comparison</h2>
            <p className="mt-1 text-xs text-[#888888]">
              Light band: pilot range • Olive: competitor
            </p>
            <div className="mt-6 flex flex-col gap-5">
              {priceBands.map((row) => (
                <div key={row.category}>
                  <div className="mb-1.5 flex justify-between text-xs font-medium">
                    <span>{row.category}</span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-[#F0EBE3]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#E8DCC8]"
                      style={{ width: `${row.pilot}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#5C6B47]/90"
                      style={{ width: `${row.competitor}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-[#EFEBE4] pt-4 text-sm">
              <span className="font-semibold">
                Average ticket:{" "}
                <span className="text-[#2D2926]">{priceBandFooter.avgTicket}</span>
              </span>
              <span className="font-semibold text-red-600">
                Premium gap: {priceBandFooter.premiumGap}
              </span>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#888888]">
              Intelligence activity feed
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All signals" },
                { id: "social", label: "Social" },
                { id: "operational", label: "Operational" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeedFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
                    feedFilter === f.id
                      ? "bg-[#2D2926] text-white"
                      : "border border-[#E0DDD4] bg-white text-[#666666] hover:bg-[#FAFAF7]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-6 flex flex-col gap-4">
            {filteredSignals.map((sig) => (
              <li
                key={sig.id}
                className="flex gap-4 rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${signalIconWrap[sig.icon]}`}
                >
                  <SignalIcon type={sig.icon} />
                </div>
                <div>
                  <p className="font-bold text-[#2D2926]">{sig.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#666666]">{sig.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
