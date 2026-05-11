"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import {
  getCurrentPilot,
  getDailyDigest,
  getLeaderboard,
  getLeaderboardHistory,
  getReviewsDigest,
  listDailyDigests,
  setStoredPilotRestaurantId,
} from "@/lib/api";
import { ApiLoader } from "@/components/api-loading";
import { MobileAppNavDrawer } from "@/components/mobile-app-nav-drawer";

const LeaderboardScoreChart = dynamic(
  () =>
    import("@/components/leaderboard-score-chart").then(
      (m) => m.LeaderboardScoreChart,
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

function recommendationBadgeClass(rec) {
  const r = (rec || "").toLowerCase();
  if (r.includes("ignore")) return "border-zinc-300 bg-zinc-100 text-zinc-800";
  if (r.includes("watch")) return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-emerald-300 bg-emerald-50 text-emerald-900";
}

function formatDigestDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function previousIsoDate(iso) {
  if (!iso) return iso;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildHistoryChart(history, leaderboardNames) {
  if (!history || typeof history !== "object") {
    return { chartData: [], lineKeys: [] };
  }
  const dates = new Set();
  for (const series of Object.values(history)) {
    if (Array.isArray(series)) {
      series.forEach((p) => {
        if (p?.date) dates.add(p.date);
      });
    }
  }
  const sortedDates = [...dates].sort();
  const keys = Object.keys(history);
  const chartData = sortedDates.map((date) => {
    const row = { date };
    keys.forEach((rid) => {
      const series = history[rid];
      const point = Array.isArray(series)
        ? series.find((p) => p.date === date)
        : null;
      row[`r${rid}`] =
        point?.total_score != null
          ? Number.parseFloat(String(point.total_score))
          : null;
    });
    return row;
  });
  const lineKeys = keys.map((rid) => ({
    key: `r${rid}`,
    name: leaderboardNames[rid] || `Restaurant ${rid}`,
  }));
  return { chartData, lineKeys };
}

export function DailyDigestDashboard() {
  const router = useRouter();
  const [pilotRecordId, setPilotRecordId] = useState(null);
  const [pilotRestaurantName, setPilotRestaurantName] = useState("");
  const [competitorSetId, setCompetitorSetId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10);
  });
  const [digest, setDigest] = useState(null);
  const [reviewsDigest, setReviewsDigest] = useState(null);
  const [digestList, setDigestList] = useState([]);
  const [digestError, setDigestError] = useState(null);
  const [reviewsDigestError, setReviewsDigestError] = useState(null);
  const [history, setHistory] = useState(null);
  const [leaderboardNames, setLeaderboardNames] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [pilotBootstrapDone, setPilotBootstrapDone] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestListLoading, setDigestListLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadPilot = useCallback(async () => {
    setLoadError(null);
    const cur = await getCurrentPilot();
    const pr = cur?.pilot_restaurant;
    if (!pr?.id) {
      router.replace("/");
      return null;
    }
    setStoredPilotRestaurantId(pr.id);
    setPilotRecordId(pr.id);
    setPilotRestaurantName(pr.restaurant?.name ?? "");
    setCompetitorSetId(pr.active_competitor_set_id ?? null);
    return pr;
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadPilot();
      } catch (e) {
        if (!cancelled) {
          if (e.status === 404) router.replace("/");
          else setLoadError(e.message || "Could not load pilot");
        }
      } finally {
        if (!cancelled) setPilotBootstrapDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPilot, router]);

  useEffect(() => {
    if (pilotRecordId == null) return;
    let cancelled = false;
    (async () => {
      setDigestLoading(true);
      setDigestError(null);
      setReviewsDigestError(null);
      try {
        const reviewsDate = previousIsoDate(selectedDate);
        const [dailyRes, reviewsRes] = await Promise.allSettled([
          getDailyDigest(pilotRecordId, selectedDate),
          getReviewsDigest(pilotRecordId, reviewsDate),
        ]);
        if (cancelled) return;

        if (dailyRes.status === "fulfilled") {
          setDigest(dailyRes.value?.daily_digest ?? null);
        } else {
          setDigest(null);
          const e = dailyRes.reason;
          if (e?.code !== "no_digest") {
            setDigestError(e?.message || "Could not load digest");
          }
        }

        if (reviewsRes.status === "fulfilled") {
          setReviewsDigest(reviewsRes.value?.reviews_digest ?? null);
        } else {
          setReviewsDigest(null);
          const e = reviewsRes.reason;
          if (e?.code !== "no_digest") {
            setReviewsDigestError(
              e?.message || "Could not load reviews digest",
            );
          }
        }
      } finally {
        if (!cancelled) setDigestLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pilotRecordId, selectedDate]);

  useEffect(() => {
    if (pilotRecordId == null) return;
    let cancelled = false;
    (async () => {
      setDigestListLoading(true);
      try {
        const list = await listDailyDigests(pilotRecordId);
        if (!cancelled) setDigestList(list?.daily_digests ?? []);
      } catch {
        if (!cancelled) setDigestList([]);
      } finally {
        if (!cancelled) setDigestListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pilotRecordId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (competitorSetId == null) {
        setHistory(null);
        setHistoryLoading(false);
        return;
      }
      setHistoryLoading(true);
      try {
        const h = await getLeaderboardHistory(competitorSetId);
        if (!cancelled) setHistory(h?.history ?? null);
      } catch {
        if (!cancelled) setHistory(null);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [competitorSetId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (competitorSetId == null) {
        setLeaderboardNames({});
        return;
      }
      try {
        const lb = await getLeaderboard(competitorSetId, selectedDate);
        const map = {};
        (lb?.leaderboard ?? []).forEach((row) => {
          map[String(row.restaurant_id)] = row.name;
        });
        if (!cancelled) setLeaderboardNames(map);
      } catch {
        if (!cancelled) setLeaderboardNames({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [competitorSetId, selectedDate]);

  const { chartData, lineKeys } = useMemo(
    () => buildHistoryChart(history, leaderboardNames),
    [history, leaderboardNames],
  );

  const digestCards = digest?.cards ?? [];
  const generatedAt = digest?.generated_at
    ? new Date(digest.generated_at).toLocaleString()
    : null;

  const reviewsDigestRestaurants = useMemo(() => {
    const list = reviewsDigest?.restaurants;
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      if (a.role === "pilot" && b.role !== "pilot") return -1;
      if (a.role !== "pilot" && b.role === "pilot") return 1;
      return (a.restaurant_name || "").localeCompare(b.restaurant_name || "");
    });
  }, [reviewsDigest]);

  const reviewsDigestGeneratedAt = reviewsDigest?.generated_at
    ? new Date(reviewsDigest.generated_at).toLocaleString()
    : null;

  const digestListUnique = useMemo(() => {
    const map = new Map();
    for (const d of digestList) {
      const date = d.digest_date;
      if (date == null || date === "") continue;
      const prev = map.get(date);
      if (!prev) {
        map.set(date, d);
      } else {
        map.set(date, {
          ...prev,
          quiet_day: Boolean(prev.quiet_day || d.quiet_day),
        });
      }
    }
    return [...map.values()];
  }, [digestList]);

  return (
    <div className="min-h-screen bg-[#FDF8EE] pb-24 text-[#2D2926]">
      <MobileAppNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        active="digest"
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

        {!pilotBootstrapDone && !loadError ? (
          <ApiLoader message="Loading your workspace…" size="page" />
        ) : null}

        {pilotBootstrapDone || loadError ? (
        <>
        <div className="grid gap-5 lg:grid-cols-[1fr_220px] lg:gap-6">
          <div className="grid gap-5 lg:col-span-1 lg:grid-cols-3 lg:gap-6">
            <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                <Zap className="size-3.5 text-amber-500" aria-hidden />
                Daily digest
              </div>
              <h2 className="mt-3 text-xl font-bold leading-tight sm:text-2xl">
                {formatDigestDate(selectedDate)}
                {digest?.quiet_day ? (
                  <span className="ml-2 text-sm font-normal text-[#666666]">
                    (quiet day)
                  </span>
                ) : null}
              </h2>
              {digestLoading ? (
                <ApiLoader message="Loading digest…" size="inline" className="items-start py-8" />
              ) : (
                <>
                  {digestError ? (
                    <p className="mt-3 text-sm text-red-700">{digestError}</p>
                  ) : null}
                  {digest?.summary ? (
                    <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-[15px]">
                      {digest.summary}
                    </p>
                  ) : !digest && pilotRecordId ? (
                    <p className="mt-3 text-sm text-[#666666]">
                      No digest published for this date yet.
                    </p>
                  ) : null}
                  {digest?.status ? (
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                      Status: {digest.status}
                      {generatedAt ? ` · Generated ${generatedAt}` : ""}
                    </p>
                  ) : null}
                </>
              )}
            </section>

            <section className="flex flex-col justify-between rounded-2xl bg-[#5C6B47] p-6 text-white shadow-sm sm:p-7">
              <div>
                <Sparkles className="size-8 text-white/90" aria-hidden />
                <h2 className="mt-4 text-xl font-bold">Ask the assistant</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  Explore pricing, menus, and competitor moves with the chat tool.
                </p>
              </div>
              <Link
                href="/chat"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-[#5C6B47] shadow-sm transition-opacity hover:opacity-95"
              >
                Open AI chat
              </Link>
            </section>
          </div>

          <aside className="rounded-2xl border border-[#E5E0D6] bg-white p-4 shadow-sm lg:max-h-[480px] lg:overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
              Digest dates
            </p>
            {digestListLoading ? (
              <ApiLoader message="Loading dates…" size="compact" className="mt-4 justify-start py-6" />
            ) : null}
            <ul className="mt-3 flex flex-col gap-1">
              {digestListUnique.map((d) => (
                <li key={d.digest_date}>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(d.digest_date)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                      d.digest_date === selectedDate
                        ? "bg-[#FFF9EC] font-semibold text-[#2D2926]"
                        : "text-[#666666] hover:bg-[#FAFAF7]"
                    }`}
                  >
                    {d.digest_date}
                    {d.quiet_day ? (
                      <span className="ml-1 text-xs font-normal text-[#888888]">
                        · quiet
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            {!digestListLoading && digestListUnique.length === 0 ? (
              <p className="mt-2 text-xs text-[#888888]">No past digests.</p>
            ) : null}
          </aside>
        </div>

        <section className="mt-8 lg:mt-10">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Competitor highlights</h2>
            {pilotRestaurantName ? (
              <p className="text-xs text-[#666666]">
                Pilot: <span className="font-semibold">{pilotRestaurantName}</span>
              </p>
            ) : null}
          </div>

          {digestLoading ? (
            <ApiLoader message="Loading highlights…" size="section" className="min-h-[120px]" />
          ) : digestCards.length === 0 ? (
            <p className="text-sm text-[#666666]">
              {digest?.quiet_day
                ? "No competitor cards for this digest."
                : "No cards for this day."}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {digestCards.map((row) => (
                <Link
                  key={row.id}
                  href={`/competitor/${row.competitor_restaurant_id}`}
                  className="block overflow-hidden rounded-2xl border border-[#E5E0D6] border-l-4 border-l-[#5C6B47] bg-white shadow-sm transition-opacity hover:opacity-[0.98]"
                >
                  <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                        Competitor
                      </p>
                      <p className="mt-1 font-bold text-[#2D2926]">
                        {leaderboardNames[String(row.competitor_restaurant_id)] ||
                          `Restaurant ${row.competitor_restaurant_id}`}
                      </p>
                      {row.priority != null ? (
                        <p className="mt-2 text-xs font-semibold text-[#666666]">
                          Priority {row.priority}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                        What changed
                      </p>
                      <p className="mt-1 text-sm leading-snug text-[#2D2926]">
                        {row.change_summary || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                        Why it matters
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#666666]">
                        {row.why_it_matters || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                        Recommendation
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${recommendationBadgeClass(row.recommendation)}`}
                      >
                        {row.recommendation || "—"}
                      </span>
                      {row.rationale ? (
                        <p className="mt-2 text-xs italic text-[#666666]">
                          {row.rationale}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 lg:mt-10" aria-labelledby="reviews-digest-heading">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="reviews-digest-heading" className="text-lg font-bold sm:text-xl">
                Reviews digest
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-[#666666] sm:text-sm">
                Past summaries from Google reviews for your pilot and tracked competitors on this
                digest day.
              </p>
            </div>
            {reviewsDigest?.digest_date ? (
              <p className="text-xs text-[#888888]">
                Digest day:{" "}
                <span className="font-semibold text-[#2D2926]">{reviewsDigest.digest_date}</span>
                {reviewsDigestGeneratedAt ? (
                  <>
                    {" "}
                    · Generated {reviewsDigestGeneratedAt}
                  </>
                ) : null}
                {reviewsDigest.status ? (
                  <>
                    {" "}
                    · {reviewsDigest.status}
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          {digestLoading ? (
            <ApiLoader message="Loading reviews digest…" size="section" className="min-h-[100px]" />
          ) : reviewsDigestError ? (
            <p className="text-sm text-red-700">{reviewsDigestError}</p>
          ) : !reviewsDigest ? (
            <p className="text-sm text-[#666666]">
              No reviews digest for this date yet.
            </p>
          ) : reviewsDigestRestaurants.length === 0 ? (
            <p className="text-sm text-[#666666]">No venues in this reviews digest.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviewsDigestRestaurants.map((r) => {
                const isPilot = r.role === "pilot";
                const reviews = Array.isArray(r.reviews) ? r.reviews : [];
                const rid = r.restaurant_id;
                return (
                  <article
                    key={rid}
                    className="overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-sm"
                  >
                    <div className="border-b border-[#EFEBE4] bg-[#FAFAF7] px-4 py-3 sm:px-5 sm:py-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          {rid != null ? (
                            <Link
                              href={`/competitor/${rid}`}
                              className="text-base font-bold text-[#5C6B47] hover:underline sm:text-lg"
                            >
                              {r.restaurant_name || `Restaurant ${rid}`}
                            </Link>
                          ) : (
                            <p className="text-base font-bold text-[#2D2926] sm:text-lg">
                              {r.restaurant_name || "—"}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-[#666666]">
                            {r.returned_reviews ?? reviews.length} of {r.total_reviews ?? "—"}{" "}
                            reviews sampled
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            isPilot
                              ? "bg-[#5C6B47] text-white"
                              : "border border-[#D4CFC4] bg-white text-[#666666]"
                          }`}
                        >
                          {isPilot ? "Pilot" : "Competitor"}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5 sm:py-5">
                      {r.summary ? (
                        <p className="text-sm leading-relaxed text-[#444] sm:text-[15px]">
                          {r.summary}
                        </p>
                      ) : (
                        <p className="text-sm text-[#888888]">No summary for this venue.</p>
                      )}
                      {reviews.length > 0 ? (
                        <details className="group mt-4">
                          <summary className="cursor-pointer list-none text-sm font-semibold text-[#5C6B47] marker:hidden [&::-webkit-details-marker]:hidden">
                            <span className="underline-offset-2 group-open:underline">
                              Show {reviews.length}{" "}
                              {reviews.length === 1 ? "review" : "reviews"}
                            </span>
                          </summary>
                          <ul className="mt-3 flex flex-col gap-3 border-t border-[#EFEBE4] pt-3">
                            {reviews.map((rev) => (
                              <li
                                key={rev.review_id || `${rev.reviewer_name}-${rev.date_raw}`}
                                className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 sm:p-4"
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <p className="text-sm font-semibold text-[#2D2926]">
                                    {rev.reviewer_name || "Anonymous"}
                                    {rev.local_guide ? (
                                      <span className="ml-2 text-[9px] font-bold uppercase tracking-wide text-[#888888]">
                                        · Local Guide
                                      </span>
                                    ) : null}
                                  </p>
                                  <div className="flex items-center gap-1 text-sm font-bold text-[#2D2926]">
                                    <Star
                                      className="size-3.5 fill-[#FFD700] text-[#FFD700]"
                                      aria-hidden
                                    />
                                    {rev.rating != null ? rev.rating : "—"}
                                  </div>
                                </div>
                                <p className="mt-1 text-[11px] text-[#888888]">{rev.date_raw || "—"}</p>
                                {rev.review_text ? (
                                  <p className="mt-2 text-sm leading-relaxed text-[#444]">
                                    {rev.review_text}
                                  </p>
                                ) : null}
                                {rev.likes != null && rev.likes > 0 ? (
                                  <p className="mt-2 text-xs text-[#666666]">{rev.likes} likes</p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6 lg:mt-10">
          <h3 className="text-lg font-bold sm:text-xl">
            Competitive health score (history)
          </h3>
          {!competitorSetId ? (
            <p className="mt-3 text-sm text-[#666666]">
              Complete competitor onboarding to see score trends for your set.
            </p>
          ) : historyLoading ? (
            <div className="mt-4 min-w-0">
              <ApiLoader message="Loading score history…" size="section" className="min-h-[220px] sm:min-h-[260px]" />
            </div>
          ) : (
            <div className="mt-4 min-w-0">
              <LeaderboardScoreChart chartData={chartData} lineKeys={lineKeys} />
            </div>
          )}
        </section>
        </>
        ) : null}
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
