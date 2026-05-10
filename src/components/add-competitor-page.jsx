"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Search,
  UserMinus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCompetitorSetMember,
  getCompetitorSet,
  getCurrentPilot,
  getSuggestedCompetitors,
  removeCompetitorSetMember,
  searchRestaurants,
  setStoredPilotRestaurantId,
} from "@/lib/api";
import { ApiLoader } from "@/components/api-loading";
import { restaurantImageSrc } from "@/lib/restaurant-image";

function formatMemberSource(source) {
  if (!source) return "—";
  return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
}

export function AddCompetitorPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [competitorSetId, setCompetitorSetId] = useState(null);
  const [members, setMembers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(query.trim()), 320);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (debouncedQ.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      setActionError(null);
      try {
        const data = await searchRestaurants(debouncedQ, 15);
        if (!cancelled) setSearchResults(data?.results ?? []);
      } catch (e) {
        if (!cancelled) {
          setSearchResults([]);
          setActionError(e.message || "Search failed");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const refreshSet = useCallback(async (setId) => {
    if (setId == null) return;
    const data = await getCompetitorSet(setId);
    const active = (data?.competitor_set?.members ?? []).filter(
      (m) => m.removed_at == null,
    );
    setMembers(active);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const cur = await getCurrentPilot();
        const pr = cur?.pilot_restaurant;
        if (!pr?.id) {
          router.replace("/");
          return;
        }
        setStoredPilotRestaurantId(pr.id);
        const setId = pr.active_competitor_set_id;
        if (!cancelled) setCompetitorSetId(setId ?? null);
        if (setId) {
          await refreshSet(setId);
        } else if (!cancelled) {
          setMembers([]);
        }
        const sug = await getSuggestedCompetitors(pr.id, 12);
        if (!cancelled) setSuggestions(sug?.suggestions ?? []);
      } catch (e) {
        if (!cancelled) {
          if (e.status === 404) router.replace("/");
          else setLoadError(e.message || "Could not load");
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSet, router]);

  const memberRestaurantIds = useMemo(
    () => new Set(members.map((m) => m.restaurant_id)),
    [members],
  );

  const addRestaurant = async (restaurantId) => {
    if (competitorSetId == null) {
      setActionError("No active competitor set. Finish onboarding first.");
      return;
    }
    if (memberRestaurantIds.has(restaurantId)) {
      setActionError("That restaurant is already in the set.");
      return;
    }
    setActionError(null);
    setPendingId(restaurantId);
    try {
      await addCompetitorSetMember(competitorSetId, restaurantId, "manual");
      await refreshSet(competitorSetId);
      setQuery("");
      setSearchResults([]);
    } catch (e) {
      setActionError(e.message || "Could not add member");
    } finally {
      setPendingId(null);
    }
  };

  const removeMember = async (member) => {
    if (competitorSetId == null) return;
    setActionError(null);
    setPendingId(member.id);
    try {
      await removeCompetitorSetMember(competitorSetId, member.id);
      await refreshSet(competitorSetId);
    } catch (e) {
      setActionError(e.message || "Could not remove");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8EE] text-[#2D2926]">
      <header className="border-b border-[#E8E4DC] bg-[#FAFAF7]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#5C6B47] hover:underline"
          >
            ← Back
          </Link>
          <span className="text-sm font-bold text-[#2D2926]">Add Competitor</span>
          <span className="w-14 sm:w-20" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loadError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </p>
        ) : null}

        {pageLoading && !loadError ? (
          <ApiLoader message="Loading competitor set and suggestions…" size="page" />
        ) : null}

        {pageLoading && !loadError ? null : (
          <>
        {actionError ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {actionError}
          </p>
        ) : null}

        {!competitorSetId ? (
          <p className="mb-6 text-sm text-[#666666]">
            You need an active competitor set before adding venues.{" "}
            <Link href="/competitors" className="font-semibold text-[#5C6B47] underline">
              Complete onboarding
            </Link>
            .
          </p>
        ) : null}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants by name…"
            className="w-full rounded-2xl border border-[#E5E0D6] bg-white py-4 pl-12 pr-4 text-[15px] text-[#2D2926] shadow-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#FFD700]/25"
            aria-label="Search restaurants"
          />
        </div>
        <p className="mt-3 text-xs text-[#6B7280]">
          Type at least two characters to search the directory.
        </p>

        <section className="mt-10 rounded-2xl border border-[#E5E0D6] bg-gradient-to-b from-white to-[#FAFAF8] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#5C6B47]/10 text-[#5C6B47]">
                <Users className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#2D2926] sm:text-xl">
                  Active set members
                </h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {members.length === 0
                    ? "No venues in this competitor set yet."
                    : `${members.length} restaurant${members.length === 1 ? "" : "s"} in your active set.`}
                </p>
              </div>
            </div>
          </div>

          {members.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-[#D8D0C4] bg-white/80 px-4 py-10 text-center text-sm text-[#6B7280]">
              Add venues from search or suggestions below.
            </p>
          ) : (
            <ul className="mt-6 grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((t) => (
                <li key={t.id}>
                  <div className="flex h-full flex-col rounded-xl border border-[#E8E4DC] bg-white p-4 shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-md">
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className="line-clamp-2 text-sm font-semibold leading-snug text-[#2D2926]"
                        title={t.name || undefined}
                      >
                        {t.name || `Restaurant ${t.restaurant_id}`}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-md bg-[#F5F2E9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5C6B47]">
                          {formatMemberSource(t.source)}
                        </span>
                        <span className="text-[11px] tabular-nums text-[#9CA3AF]">
                          #{t.restaurant_id}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pendingId != null}
                      onClick={() => removeMember(t)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E8E4DC] bg-[#FAFAF8] py-2 text-xs font-medium text-[#57534E] transition-colors hover:border-[#D6D3D1] hover:bg-[#F5F5F4] hover:text-[#1C1917] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <UserMinus className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      Remove from set
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {searchLoading ? (
          <ApiLoader message="Searching restaurants…" size="inline" className="mt-4 justify-start" />
        ) : debouncedQ.length >= 2 && searchResults.length === 0 ? (
          <p className="mt-4 text-sm text-[#666666]">No matches.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {searchResults.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8E4DC] bg-white p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#F0EBE3]">
                    <Image
                      src={restaurantImageSrc(r.image_url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-[#666666]">
                      {[r.locality, r.area].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pendingId != null || !competitorSetId}
                  onClick={() => addRestaurant(r.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#FFD700] px-3 py-2 text-xs font-bold text-black disabled:opacity-45"
                >
                  <Plus className="size-4" aria-hidden />
                  Add to set
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <MapPin className="size-5 text-[#5C6B47]" aria-hidden />
            Suggested nearby
          </h2>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((r) => (
            <article
              key={r.restaurant_id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DC] bg-white shadow-md"
            >
              <div className="relative aspect-[16/10] w-full bg-[#F0EBE3]">
                <Image
                  src={restaurantImageSrc(r.image_url)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{r.name}</h3>
                <p className="mt-1 text-sm text-[#666666]">
                  {[r.locality, r.area].filter(Boolean).join(" · ")} ·{" "}
                  {r.distance_km != null ? `${Number(r.distance_km).toFixed(2)} km` : ""}
                </p>
                <p className="mt-2 text-xs text-[#666666]">
                  Score {r.suggestion_score != null ? String(r.suggestion_score) : "—"}
                </p>
                <button
                  type="button"
                  disabled={pendingId != null || !competitorSetId}
                  onClick={() => addRestaurant(r.restaurant_id)}
                  className="mt-3 w-full rounded-lg bg-[#5C6B47] py-2 text-sm font-bold text-white disabled:opacity-45"
                >
                  Add to set
                </button>
              </div>
            </article>
          ))}
        </div>
          </>
        )}
      </main>
    </div>
  );
}
