"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Search } from "lucide-react";
import { restaurantImageSrc } from "@/lib/restaurant-image";
import {
  clearStoredChatSessionId,
  searchRestaurants,
  setPilotRestaurant,
  setStoredPilotRestaurantId,
} from "@/lib/api";

export function PilotRestaurantSelection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchRestaurants(debouncedQ, 20);
        if (!cancelled) setResults(data?.results ?? []);
      } catch (e) {
        if (!cancelled) {
          setResults([]);
          setError(e.message || "Search failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const filtered = useMemo(() => results, [results]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  }, []);

  const continueWithSelection = useCallback(async () => {
    if (selectedId == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await setPilotRestaurant(selectedId);
      const pr = data?.pilot_restaurant;
      if (pr?.id != null) {
        setStoredPilotRestaurantId(pr.id);
        clearStoredChatSessionId();
      }
      router.push("/competitors");
    } catch (e) {
      setError(e.message || "Could not save pilot restaurant");
    } finally {
      setSubmitting(false);
    }
  }, [router, selectedId]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFBF0] text-[#1A1A1A]">
      <header className="flex w-full shrink-0 items-start justify-between gap-4 px-4 pt-6 pb-2 sm:px-8 sm:pt-8">
        <span className="text-lg font-bold tracking-tight text-[#1A1A1A] sm:text-xl">
          DineIntel
        </span>
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="flex w-20 gap-1 sm:w-24"
            role="img"
            aria-label="Step 1 of 3"
          >
            <span className="h-1 flex-1 rounded-full bg-[#FFD700]" />
            <span className="h-1 flex-1 rounded-full bg-[#E5E2D8]" />
            <span className="h-1 flex-1 rounded-full bg-[#E5E2D8]" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4 sm:px-6 sm:pb-16">
        <div className="w-full max-w-[560px]">
          <h1 className="text-center text-2xl font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-3xl">
            Select Your Pilot Restaurant
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280] sm:text-base">
            Connect your establishment to begin the intelligence audit.
          </p>

          <div className="relative mt-8">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for your restaurant..."
              className="w-full rounded-xl border border-[#E8E4DC] bg-white py-3.5 pl-11 pr-28 text-sm text-[#1A1A1A] shadow-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#D4CFC4] focus:ring-2 focus:ring-[#FFD700]/35 sm:py-4 sm:pr-32 sm:text-[15px]"
              aria-label="Search restaurants"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-medium uppercase tracking-wide text-[#9CA3AF] sm:right-3 sm:text-[10px]">
              ESC TO CLEAR
            </span>
          </div>

          <p className="mt-2 text-xs text-[#6B7280]">
            Type at least two characters to search the directory.
          </p>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            RESULTS
          </p>

          <div className="mt-2 overflow-hidden rounded-xl bg-[#F5F1E6]">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
                Searching…
              </p>
            ) : debouncedQ.length < 2 ? (
              <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
                Start typing to see restaurants.
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
                No restaurants match your search.
              </p>
            ) : (
              <ul className="divide-y divide-[#E8E0D4]">
                {filtered.map((r) => {
                  const isSelected = selectedId === r.id;
                  const loc = [r.locality, r.area].filter(Boolean).join(" · ");
                  const rating =
                    r.rating != null && r.rating !== ""
                      ? `${r.rating}★`
                      : null;
                  const reviews =
                    r.review_count != null ? `${r.review_count} reviews` : null;
                  const badge = [rating, reviews].filter(Boolean).join(" · ");
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedId((prev) => (prev === r.id ? null : r.id))
                        }
                        className={`flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors sm:gap-4 sm:px-4 sm:py-4 ${
                          isSelected
                            ? "bg-[#FFF9EC] ring-2 ring-inset ring-[#FFD700]/60"
                            : "hover:bg-[#EFEBE2]/80"
                        }`}
                      >
                        <span className="relative flex size-10 shrink-0 overflow-hidden rounded-md bg-[#D9CFC4] sm:size-11">
                          <Image
                            src={restaurantImageSrc(r.image_url)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#1A1A1A] sm:text-[15px]">
                            {r.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#6B7280] sm:text-sm">
                            {loc || "—"}
                          </p>
                        </div>
                        {badge ? (
                          <span className="inline-flex max-w-[40%] shrink-0 truncate rounded-full border border-[#D4D0C8] bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4B5563] sm:px-2.5 sm:py-1 sm:text-[10px]">
                            {badge}
                          </span>
                        ) : null}
                        <ChevronRight
                          className="size-5 shrink-0 text-[#9CA3AF]"
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selectedId === null ? (
            <button
              type="button"
              disabled
              className="mt-8 w-full rounded-xl bg-[#FFD700] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-sm disabled:cursor-not-allowed disabled:opacity-45 sm:py-4 sm:text-base"
            >
              Continue with Selection
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={continueWithSelection}
              className="mt-8 w-full rounded-xl bg-[#FFD700] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 sm:py-4 sm:text-base"
            >
              {submitting ? "Saving…" : "Continue with Selection"}
            </button>
          )}

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            <Link
              href="/add-competitor"
              className="font-medium underline-offset-2 hover:text-[#1A1A1A] hover:underline"
            >
              + Add a tracked competitor later from the dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
