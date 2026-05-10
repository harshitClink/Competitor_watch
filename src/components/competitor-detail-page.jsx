"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Megaphone,
  Radio,
  Star,
} from "lucide-react";
import {
  getActivityFeed,
  getCurrentPilot,
  getGoogleReviews,
  getMenuChanges,
  getPricingAnalysis,
  getRatingTrend,
  getRestaurant,
  getRestaurantMenu,
  getSerpPresence,
  getSocialSignals,
  getThreatAssessments,
  setStoredPilotRestaurantId,
} from "@/lib/api";
import { ApiLoader } from "@/components/api-loading";
import { restaurantImageSrc } from "@/lib/restaurant-image";

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

function eventIconType(eventType) {
  const t = (eventType || "").toLowerCase();
  if (t.includes("offer") || t.includes("promo")) return "blue";
  if (t.includes("price") || t.includes("menu")) return "red";
  return "amber";
}

function SignalIcon({ type }) {
  if (type === "blue") {
    return <Megaphone className="size-5" aria-hidden />;
  }
  if (type === "red") {
    return <Radio className="size-5" aria-hidden />;
  }
  return <Building2 className="size-5" aria-hidden />;
}

function formatMenuEvent(e) {
  const tag = (e.event_type || "").replace(/_/g, " ");
  const date = e.scrapped_at_date || e.prev_scrapped_at_date || "";
  let priceLine = "";
  if (e.new_price != null) {
    priceLine =
      e.prev_price != null
        ? `₹${e.prev_price} → ₹${e.new_price}`
        : `₹${e.new_price}`;
  }
  return { tag, date, priceLine };
}

function formatReviewAttrLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** @param {{ veg?: boolean | string | number | null }} props */
function VegNonVegIcon({ veg }) {
  const v =
    veg === true ||
    veg === 1 ||
    (typeof veg === "string" && veg.toLowerCase() === "true");
  const nv =
    veg === false ||
    veg === 0 ||
    (typeof veg === "string" && veg.toLowerCase() === "false");
  if (v) {
    return (
      <span
        className="mt-0.5 inline-flex size-[15px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-[#0F7A40]"
        title="Vegetarian"
        aria-label="Vegetarian"
      >
        <span className="size-[7px] rounded-full bg-[#0F7A40]" />
      </span>
    );
  }
  if (nv) {
    return (
      <span
        className="mt-0.5 inline-flex size-[15px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-[#C62828]"
        title="Non-vegetarian"
        aria-label="Non-vegetarian"
      >
        <svg
          viewBox="0 0 10 10"
          className="size-2 shrink-0 fill-[#C62828]"
          aria-hidden
        >
          <polygon points="5,1 9,9 1,9" />
        </svg>
      </span>
    );
  }
  return null;
}

export function CompetitorDetailPage({ slug }) {
  const router = useRouter();
  const restaurantId = Number.parseInt(String(slug), 10);
  const invalidId = !Number.isFinite(restaurantId);
  const [pilotRecordId, setPilotRecordId] = useState(null);
  const [pilotRestaurantId, setPilotRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [threat, setThreat] = useState(null);
  const [ratingChartData, setRatingChartData] = useState([]);
  const [menuChanges, setMenuChanges] = useState([]);
  const [pricingCategories, setPricingCategories] = useState([]);
  const [pricingMeta, setPricingMeta] = useState({ targetId: null, pilotId: null });
  const [activityEvents, setActivityEvents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuMeta, setMenuMeta] = useState(null);
  const [socialPosts, setSocialPosts] = useState([]);
  const [serp, setSerp] = useState(null);
  const [googleReviews, setGoogleReviews] = useState(null);
  const [googleReviewsLoading, setGoogleReviewsLoading] = useState(true);
  const [googleReviewsError, setGoogleReviewsError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState("all");

  const loadPilot = useCallback(async () => {
    const cur = await getCurrentPilot();
    const pr = cur?.pilot_restaurant;
    if (!pr?.id) {
      router.replace("/");
      return null;
    }
    setStoredPilotRestaurantId(pr.id);
    setPilotRecordId(pr.id);
    const prid = pr.restaurant?.id ?? null;
    setPilotRestaurantId(prid);
    return pr;
  }, [router]);

  useEffect(() => {
    if (invalidId) return;
    let cancelled = false;
    (async () => {
      setLoadError(null);
      setProfileLoading(true);
      try {
        await loadPilot();
        const res = await getRestaurant(restaurantId);
        if (!cancelled) setRestaurant(res?.restaurant ?? null);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || "Failed to load restaurant");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invalidId, loadPilot, restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId) || pilotRecordId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getThreatAssessments(pilotRecordId);
        const list = data?.threat_assessments ?? [];
        const row = list.find(
          (t) => t.competitor_restaurant_id === restaurantId,
        );
        if (!cancelled) setThreat(row ?? null);
      } catch {
        if (!cancelled) setThreat(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pilotRecordId, restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getRatingTrend(restaurantId);
        const series = data?.series ?? [];
        const chart = series.map((p) => ({
          date: p.date,
          avg_rating:
            p.avg_rating != null && p.avg_rating !== ""
              ? Number.parseFloat(String(p.avg_rating))
              : null,
          google_rating:
            p.google_rating != null && p.google_rating !== ""
              ? Number.parseFloat(String(p.google_rating))
              : null,
        }));
        if (!cancelled) setRatingChartData(chart);
      } catch {
        if (!cancelled) setRatingChartData([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMenuChanges(restaurantId, "30d");
        if (!cancelled) setMenuChanges(data?.events ?? []);
      } catch {
        if (!cancelled) setMenuChanges([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId) || pilotRestaurantId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPricingAnalysis(restaurantId, pilotRestaurantId);
        if (!cancelled) {
          setPricingCategories(data?.categories ?? []);
          setPricingMeta({
            targetId: data?.target_id,
            pilotId: data?.pilot_id,
          });
        }
      } catch {
        if (!cancelled) {
          setPricingCategories([]);
          setPricingMeta({ targetId: null, pilotId: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, pilotRestaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getActivityFeed(restaurantId, "14d");
        if (!cancelled) setActivityEvents(data?.events ?? []);
      } catch {
        if (!cancelled) setActivityEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getRestaurantMenu(restaurantId);
        if (!cancelled) {
          setMenuItems(data?.items ?? []);
          setMenuMeta({
            scrapped_at_date: data?.scrapped_at_date,
          });
        }
      } catch {
        if (!cancelled) {
          setMenuItems([]);
          setMenuMeta(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getSocialSignals(restaurantId, "14d");
        if (!cancelled) setSocialPosts(data?.posts ?? []);
      } catch {
        if (!cancelled) setSocialPosts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getSerpPresence(restaurantId);
        if (!cancelled) setSerp(data);
      } catch {
        if (!cancelled) setSerp(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!Number.isFinite(restaurantId)) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setGoogleReviews(null);
      setGoogleReviewsLoading(true);
      setGoogleReviewsError(null);
      try {
        const data = await getGoogleReviews(restaurantId, "7d", 20);
        if (!cancelled) setGoogleReviews(data);
      } catch (e) {
        if (!cancelled) {
          setGoogleReviews(null);
          setGoogleReviewsError(e.message || "Could not load Google reviews");
        }
      } finally {
        if (!cancelled) setGoogleReviewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const isPilot = pilotRestaurantId === restaurantId;

  const headerTitle = restaurant?.name ?? (Number.isFinite(restaurantId) ? `Restaurant ${restaurantId}` : "—");
  const snap = restaurant?.latest_snapshot;
  const subtitle = snap
    ? [snap.locality, snap.area, snap.city].filter(Boolean).join(" · ")
    : "";

  const lastRating = ratingChartData[ratingChartData.length - 1];
  const googleLast = lastRating?.google_rating;
  const avgLast = lastRating?.avg_rating;

  const filteredSignals = useMemo(() => {
    if (feedFilter === "all") return activityEvents;
    return activityEvents.filter((ev) => {
      const t = (ev.event_type || "").toLowerCase();
      if (feedFilter === "social") {
        return (
          t.includes("social") ||
          t.includes("serp") ||
          t.includes("instagram")
        );
      }
      return (
        t.includes("menu") ||
        t.includes("price") ||
        t.includes("offer") ||
        t.includes("rating")
      );
    });
  }, [activityEvents, feedFilter]);

  const googleBreakdownMax = useMemo(() => {
    const rd = googleReviews?.summary?.rating_breakdown;
    if (!rd || typeof rd !== "object") return 1;
    const vals = [1, 2, 3, 4, 5].map((s) =>
      Number(rd[s] ?? rd[String(s)] ?? 0),
    );
    const m = Math.max(0, ...vals);
    return m > 0 ? m : 1;
  }, [googleReviews]);

  if (invalidId) {
    return (
      <div className="min-h-screen bg-[#FDF8EE] p-8 text-[#2D2926]">
        <p className="text-red-700">Invalid restaurant id</p>
        <Link href="/competitor-analysis" className="mt-4 inline-block text-[#5C6B47] underline">
          Back to analysis
        </Link>
      </div>
    );
  }

  if (loadError && !restaurant) {
    return (
      <div className="min-h-screen bg-[#FDF8EE] p-8 text-[#2D2926]">
        <p className="text-red-700">{loadError}</p>
        <Link href="/competitor-analysis" className="mt-4 inline-block text-[#5C6B47] underline">
          Back to analysis
        </Link>
      </div>
    );
  }

  if (profileLoading && !loadError) {
    return (
      <div className="min-h-screen bg-[#FDF8EE] pb-16 text-[#2D2926]">
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
          <ApiLoader message="Loading restaurant profile…" size="page" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8EE] pb-16 text-[#2D2926]">
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
          <span className="text-[#2D2926]">{headerTitle}</span>
        </nav>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-xl bg-[#F0EBE3] sm:block sm:size-24">
              <Image
                src={restaurantImageSrc(snap?.image_url)}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className={`${fraunces.className} text-3xl font-bold tracking-tight sm:text-4xl`}
                >
                  {headerTitle}
                </h1>
                {isPilot ? (
                  <span className="rounded-md bg-[#5C6B47] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Pilot
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[#666666] sm:text-base">
                {subtitle || "—"}
              </p>
              {restaurant?.maps_url ? (
                <a
                  href={restaurant.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#5C6B47] hover:underline"
                >
                  Maps
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {threat && !isPilot ? (
          <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">Threat assessment</h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">
                {threat.total_threat != null
                  ? `${(Number.parseFloat(String(threat.total_threat)) * 100).toFixed(1)}%`
                  : "—"}
              </span>
              <span className="text-xs font-semibold text-[#666666]">
                composite threat
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Segment overlap", threat.segment_overlap],
                ["Price band overlap", threat.price_band_overlap],
                ["Neighbourhood overlap", threat.neighbourhood_overlap],
                ["Cuisine overlap", threat.cuisine_overlap],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-[#666666]">
                    <span>{label}</span>
                    <span className="text-[#2D2926]">
                      {val != null
                        ? `${(Number.parseFloat(String(val)) * 100).toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EFEBE4]">
                    <div
                      className="h-full rounded-full bg-[#5C6B47]"
                      style={{
                        width: `${val != null ? Math.min(100, Number.parseFloat(String(val)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {threat.rationale ? (
              <div className="mt-6 rounded-xl border border-[#E8E4DC] bg-[#FAFAF7] p-4 text-sm leading-relaxed text-[#444]">
                {threat.rationale}
              </div>
            ) : null}
            {threat.computed_at ? (
              <p className="mt-3 text-[10px] text-[#888888]">
                Computed {new Date(threat.computed_at).toLocaleString()}
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Rating trend
            </h2>
            <div className="mt-4 min-w-0">
              <CompetitorDetailChart data={ratingChartData} name={headerTitle} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  Avg. rating (latest)
                </p>
                <p className="mt-1 text-sm font-bold text-[#2D2926]">
                  {avgLast != null ? avgLast.toFixed(1) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  Google rating (latest)
                </p>
                <p className="mt-1 text-sm font-bold">
                  {googleLast != null ? googleLast.toFixed(1) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-3 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                  Reviews (platform)
                </p>
                <p className="mt-1 text-sm font-bold">
                  {restaurant?.review_count ?? snap?.total_ratings ?? "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Pricing vs pilot (category averages)
            </h2>
            <p className="mt-1 text-xs text-[#888888]">
              Target #{pricingMeta.targetId} · Pilot #{pricingMeta.pilotId}
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-[#EFEBE4]">
              {pricingCategories.length === 0 ? (
                <li className="py-4 text-sm text-[#666666]">No pricing data.</li>
              ) : (
                pricingCategories.map((row) => (
                  <li key={row.name} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <span className="font-semibold text-[#2D2926]">{row.name}</span>
                    <span className="text-sm text-[#666666]">
                      This venue:{" "}
                      {row.target_avg != null ? `₹${row.target_avg}` : "—"} · Pilot:{" "}
                      {row.pilot_avg != null ? `₹${row.pilot_avg}` : "—"}
                      {row.delta != null ? (
                        <span className="ml-2 font-medium text-[#2D2926]">
                          (Δ {row.delta > 0 ? "+" : ""}
                          {row.delta})
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h2 className="text-sm font-bold sm:text-base">Google reviews</h2>
            {googleReviews?.since ? (
              <p className="text-xs text-[#888888]">
                From {googleReviews.since} · last 7 days · up to 20 reviews
              </p>
            ) : (
              <p className="text-xs text-[#888888]">
                Last 7 days · up to 20 reviews
              </p>
            )}
          </div>

          {googleReviewsLoading ? (
            <ApiLoader
              message="Loading Google reviews…"
              size="compact"
              className="mt-4 py-10"
            />
          ) : googleReviewsError ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {googleReviewsError}
            </p>
          ) : (
            <>
              {googleReviews?.summary ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                      Reviews (window)
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#2D2926]">
                      {googleReviews.summary.count ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                      Avg. rating (window)
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-[#2D2926]">
                      <Star
                        className="size-6 fill-[#FFD700] text-[#FFD700]"
                        aria-hidden
                      />
                      {googleReviews.summary.avg_rating != null
                        ? Number(googleReviews.summary.avg_rating).toFixed(2)
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4 sm:col-span-2 lg:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                      Star breakdown
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const rd =
                          googleReviews.summary.rating_breakdown ?? {};
                        const cnt = Number(rd[star] ?? rd[String(star)] ?? 0);
                        const pct =
                          googleBreakdownMax > 0
                            ? Math.round((cnt / googleBreakdownMax) * 100)
                            : 0;
                        return (
                          <li
                            key={star}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="w-8 shrink-0 font-semibold text-[#666666]">
                              {star}★
                            </span>
                            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#E8E4DC]">
                              <div
                                className="h-full rounded-full bg-[#5C6B47]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 shrink-0 text-right font-medium text-[#2D2926]">
                              {cnt}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : null}

              <ul className="mt-6 flex flex-col gap-4">
                {(googleReviews?.reviews ?? []).length === 0 ? (
                  <li className="text-sm text-[#666666]">
                    No Google reviews in this window.
                  </li>
                ) : (
                  googleReviews.reviews.map((rev) => (
                    <li
                      key={rev.review_id}
                      className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="font-bold text-[#2D2926]">
                            {rev.reviewer_name || "Anonymous"}
                            {rev.local_guide ? (
                              <span className="ml-2 inline-block rounded-md border border-[#C4BFB2] bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#666666]">
                                Local Guide
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs text-[#888888]">
                            {rev.date_raw || "—"}
                            {rev.scrapped_at_date
                              ? ` · ${rev.scrapped_at_date}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-[#2D2926]">
                          <Star
                            className="size-4 fill-[#FFD700] text-[#FFD700]"
                            aria-hidden
                          />
                          {rev.rating != null ? rev.rating : "—"}
                        </div>
                      </div>
                      {rev.review_text ? (
                        <p className="mt-3 text-sm leading-relaxed text-[#444]">
                          {rev.review_text}
                        </p>
                      ) : null}
                      {rev.likes != null && rev.likes > 0 ? (
                        <p className="mt-2 text-xs text-[#666666]">
                          {rev.likes} likes
                        </p>
                      ) : null}
                      {rev.attributes &&
                      Object.keys(rev.attributes).length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(rev.attributes).map(([k, v]) => (
                            <li
                              key={k}
                              className="rounded-lg border border-[#E0DDD4] bg-white px-2 py-1 text-[11px] text-[#444]"
                            >
                              <span className="font-semibold text-[#666666]">
                                {formatReviewAttrLabel(k)}:{" "}
                              </span>
                              {String(v)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Menu changes
            </h2>
            <ul className="mt-4 flex max-h-[420px] flex-col divide-y divide-[#EFEBE4] overflow-y-auto">
              {menuChanges.length === 0 ? (
                <li className="py-4 text-sm text-[#666666]">No menu changes in window.</li>
              ) : (
                menuChanges.map((item) => {
                  const { tag, date, priceLine } = formatMenuEvent(item);
                  return (
                    <li key={item.id} className="flex flex-col gap-2 py-4 first:pt-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-[#2D2926]">
                            {item.menu_item_name || "—"}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#888888]">
                            {tag} · {date}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md border border-[#E0DDD4] bg-[#FAFAF7] px-2 py-0.5 text-[10px] font-bold uppercase">
                          {item.category || "—"}
                        </span>
                      </div>
                      {priceLine ? (
                        <p className="text-sm font-semibold text-[#2D2926]">{priceLine}</p>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">
              Current menu
            </h2>
            {menuMeta?.scrapped_at_date ? (
              <p className="mt-1 text-xs text-[#888888]">
                As of {menuMeta.scrapped_at_date}
              </p>
            ) : null}
            <ul className="mt-4 flex max-h-[420px] flex-col divide-y divide-[#EFEBE4] overflow-y-auto">
              {menuItems.length === 0 ? (
                <li className="py-4 text-sm text-[#666666]">No menu snapshot.</li>
              ) : (
                menuItems.slice(0, 80).map((item) => (
                  <li key={item.id} className="py-3 first:pt-0">
                    <div className="flex items-start gap-2.5">
                      <VegNonVegIcon veg={item.veg} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#2D2926]">{item.name}</p>
                        <p className="text-xs text-[#666666]">
                          {[item.category, item.subcategory]
                            .filter(Boolean)
                            .join(" · ")}
                          {item.category || item.subcategory ? " · " : ""}
                          {item.price_raw ||
                            (item.price != null ? `₹${item.price}` : "—")}
                        </p>
                        {item.rating != null &&
                        item.rating !== "" ? (
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#666666]">
                            <span className="inline-flex items-center gap-0.5 font-medium text-[#2D2926]">
                              <Star
                                className="size-3.5 fill-[#FFD700] text-[#FFD700]"
                                aria-hidden
                              />
                              {item.rating}
                            </span>
                            {item.rating_count != null ? (
                              <span>
                                ({Number(item.rating_count).toLocaleString()}{" "}
                                {Number(item.rating_count) === 1
                                  ? "rating"
                                  : "ratings"}
                                )
                              </span>
                            ) : null}
                          </p>
                        ) : item.rating_count != null ? (
                          <p className="mt-1 text-xs text-[#666666]">
                            {Number(item.rating_count).toLocaleString()}{" "}
                            {Number(item.rating_count) === 1
                              ? "rating"
                              : "ratings"}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
            {menuItems.length > 80 ? (
              <p className="mt-2 text-xs text-[#888888]">Showing first 80 items.</p>
            ) : null}
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold sm:text-base">Social signals</h2>
          <p className="mt-1 text-xs text-[#888888]">Recent Instagram posts</p>
          <ul className="mt-4 flex flex-col gap-4">
            {socialPosts.length === 0 ? (
              <li className="text-sm text-[#666666]">No posts in window.</li>
            ) : (
              socialPosts.map((p) => (
                <li key={p.id} className="rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4">
                  <p className="text-xs font-semibold text-[#888888]">
                    @{p.owner_username || "—"} · {p.source} ·{" "}
                    {p.posted_at ? new Date(p.posted_at).toLocaleString() : ""}
                  </p>
                  {p.post_url ? (
                    <a
                      href={p.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#5C6B47] hover:underline"
                    >
                      View post
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                  {p.caption ? (
                    <p className="mt-2 max-h-24 overflow-hidden text-sm leading-relaxed text-[#2D2926]">
                      {p.caption}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[#666666]">
                    Likes {p.likes_count ?? 0} · Comments {p.comments_count ?? 0}
                    {p.engagement_score != null
                      ? ` · Engagement ${p.engagement_score}`
                      : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {serp ? (
          <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold sm:text-base">SERP presence</h2>
            <p className="mt-1 text-xs text-[#888888]">
              {serp.search_term} · {serp.scrapped_at_date}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {(serp.organic ?? []).slice(0, 12).map((row, i) => (
                <li key={i} className="rounded-lg border border-[#EFEBE4] bg-[#FAFAF7] p-3">
                  <p className="text-xs font-semibold text-[#888888]">
                    #{row.position} {row.result_type}
                  </p>
                  <p className="font-semibold text-[#2D2926]">{row.title}</p>
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#5C6B47] hover:underline"
                    >
                      {row.displayed_url || row.url}
                    </a>
                  ) : null}
                  {row.description ? (
                    <p className="mt-1 text-sm text-[#666666]">{row.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8 rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#888888]">
              Activity feed
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "social", label: "Social / discovery" },
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
            {filteredSignals.length === 0 ? (
              <li className="text-sm text-[#666666]">No events in this view.</li>
            ) : (
              filteredSignals.map((sig) => {
                const icon = eventIconType(sig.event_type);
                return (
                  <li
                    key={sig.id}
                    className="flex gap-4 rounded-xl border border-[#EFEBE4] bg-[#FAFAF7] p-4"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${signalIconWrap[icon]}`}
                    >
                      <SignalIcon type={icon} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#888888]">
                        {sig.event_type?.replace(/_/g, " ")} · {sig.occurred_on}
                      </p>
                      <p className="font-bold text-[#2D2926]">{sig.summary}</p>
                      {sig.significance != null ? (
                        <p className="mt-1 text-xs text-[#666666]">
                          Significance {sig.significance}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
