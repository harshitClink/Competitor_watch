"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";
import {
  Menu,
  Minus,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  getCurrentPilot,
  getLeaderboard,
  setStoredPilotRestaurantId,
} from "@/lib/api";
import { ApiLoader } from "@/components/api-loading";
import { MobileAppNavDrawer } from "@/components/mobile-app-nav-drawer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function DeltaCell({ delta }) {
  if (delta == null || delta === "") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500">
        <Minus className="size-4" aria-hidden />
        —
      </span>
    );
  }
  const n = Number.parseFloat(String(delta));
  if (Number.isNaN(n) || n === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500">
        <Minus className="size-4" aria-hidden />
        {String(delta)}
      </span>
    );
  }
  const up = n > 0;
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
      {String(delta)}
    </span>
  );
}

export function CompetitorAnalysisPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [competitorSetId, setCompetitorSetId] = useState(null);
  const [leaderboardDate, setLeaderboardDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [pilotLoading, setPilotLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadPilot = useCallback(async () => {
    const cur = await getCurrentPilot();
    const pr = cur?.pilot_restaurant;
    if (!pr?.id) {
      router.replace("/");
      return null;
    }
    setStoredPilotRestaurantId(pr.id);
    setCompetitorSetId(pr.active_competitor_set_id ?? null);
    return pr;
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      setPilotLoading(true);
      try {
        await loadPilot();
      } catch (e) {
        if (!cancelled) {
          if (e.status === 404) router.replace("/");
          else setLoadError(e.message || "Could not load pilot");
        }
      } finally {
        if (!cancelled) setPilotLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPilot, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (competitorSetId == null) {
        setRows([]);
        setLeaderboardLoading(false);
        return;
      }
      setLeaderboardLoading(true);
      try {
        const data = await getLeaderboard(competitorSetId, leaderboardDate);
        if (!cancelled) setRows(data?.leaderboard ?? []);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setLoadError(e.message || "Could not load leaderboard");
        }
      } finally {
        if (!cancelled) setLeaderboardLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [competitorSetId, leaderboardDate]);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [filter, rows]);

  const pilotRow = rows.find((r) => r.is_pilot);
  const pilotScore = pilotRow?.total_score;

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-24 text-[#2D2926]">
      <MobileAppNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        active="analysis"
      />
      <header className="sticky top-0 z-40 border-b border-[#E8E4DC] bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center justify-start gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-[#2D2926] hover:bg-[#F0EBE3] md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-6" aria-hidden />
            </button>
            <Link
              href="/dashboard"
              className={`${fraunces.className} min-w-0 truncate text-lg font-semibold tracking-tight text-[#5C6B47] sm:text-xl`}
            >
              DineIntel
            </Link>
          </div>

          <nav
            className="hidden items-center gap-6 sm:gap-8 md:flex"
            aria-label="Main"
          >
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

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/add-competitor"
              className="hidden rounded-lg bg-[#5C6B47] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:inline-flex sm:px-4 sm:text-sm"
            >
              Add Competitor
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {loadError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </p>
        ) : null}

        {pilotLoading && !loadError ? (
          <ApiLoader message="Loading competitor analysis…" size="page" />
        ) : null}

        {!pilotLoading || loadError ? (
        <>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 lg:max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
              Leaderboard
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Competitive health scores
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-base">
              Ranked scores for your active competitor set on the selected date.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-[#666666]">
                Date
                <input
                  type="date"
                  value={leaderboardDate}
                  onChange={(e) => setLeaderboardDate(e.target.value)}
                  className="ml-2 rounded-lg border border-[#E0DDD4] bg-white px-2 py-1 text-sm text-[#2D2926]"
                />
              </label>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[#E8D9A8] bg-[#FFD700] p-5 shadow-sm sm:max-w-xs lg:w-80">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2D2926]/80">
              Pilot score
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-[#2D2926]">
                {pilotScore != null && pilotScore !== ""
                  ? String(pilotScore)
                  : "—"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#2D2926]/80">
              {pilotRow?.headline_signal || ""}
            </p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#EFEBE4] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">Rankings</h2>
            </div>
            <div className="relative max-w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name…"
                className="w-full rounded-lg border border-[#E0DDD4] bg-[#FAFAF7] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5C6B47]/40 focus:ring-2 focus:ring-[#5C6B47]/20"
                aria-label="Filter restaurants"
              />
            </div>
          </div>

          {!competitorSetId ? (
            <p className="p-8 text-center text-sm text-[#666666]">
              Set up a competitor set from onboarding to see the leaderboard.
            </p>
          ) : leaderboardLoading ? (
            <ApiLoader message="Loading leaderboard…" size="section" className="min-h-[280px]" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EFEBE4] bg-[#FAFAF7] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
                    <th className="px-4 py-3 sm:px-5">Rank</th>
                    <th className="px-4 py-3 sm:px-5">Restaurant</th>
                    <th className="px-4 py-3 sm:px-5">Health score</th>
                    <th className="px-4 py-3 sm:px-5">Score delta (7d)</th>
                    <th className="px-4 py-3 sm:px-5">Headline signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={`${row.rank}-${row.restaurant_id}`}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/competitor/${row.restaurant_id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/competitor/${row.restaurant_id}`);
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
                          {row.is_pilot ? (
                            <span className="rounded bg-[#D4AF37] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2D2926]">
                              Pilot
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-base font-bold sm:px-5">
                        {row.total_score != null ? String(row.total_score) : "—"}
                      </td>
                      <td className="px-4 py-4 sm:px-5">
                        <DeltaCell delta={row.score_delta_7d} />
                      </td>
                      <td className="max-w-xs px-4 py-4 text-[13px] leading-snug text-[#444] sm:px-5">
                        {row.headline_signal || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {competitorSetId && !leaderboardLoading && filteredRows.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#666666]">
              No rows for this date or filter.
            </p>
          ) : null}

          {competitorSetId && !leaderboardLoading ? (
            <div className="border-t border-[#EFEBE4] px-5 py-4">
              <p className="text-xs text-[#666666]">
                Showing {filteredRows.length} of {rows.length} restaurants
              </p>
            </div>
          ) : null}
        </section>
        </>
        ) : null}
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
