"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  createCompetitorSet,
  getCurrentPilot,
  getSuggestedCompetitors,
  setStoredPilotRestaurantId,
} from "@/lib/api";
import { ApiLoader } from "@/components/api-loading";
import { CompetitorCard } from "@/components/competitor-card";
import { DashboardSetupLoading } from "@/components/dashboard-setup-loading";

export function CompetitorSelection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [setupLoadingOpen, setSetupLoadingOpen] = useState(false);
  const [pilotRecordId, setPilotRecordId] = useState(null);
  const [pilotRestaurantId, setPilotRestaurantId] = useState(null);
  const [pilotName, setPilotName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [setupError, setSetupError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      setSuggestionsLoading(true);
      try {
        const cur = await getCurrentPilot();
        const pr = cur?.pilot_restaurant;
        if (!pr?.id) {
          router.replace("/");
          return;
        }
        if (!cancelled) {
          setPilotRecordId(pr.id);
          setPilotRestaurantId(pr.restaurant?.id ?? null);
          setPilotName(pr.restaurant?.name ?? "");
          setStoredPilotRestaurantId(pr.id);
        }
        const sug = await getSuggestedCompetitors(pr.id, 24);
        const list = sug?.suggestions ?? [];
        if (!cancelled) {
          setSuggestions(list);
          setSelectedIds(new Set());
        }
      } catch (e) {
        if (!cancelled) {
          if (e.status === 404) router.replace("/");
          else setLoadError(e.message || "Could not load suggestions");
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const loc = `${c.locality || ""} ${c.area || ""}`.toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [query, suggestions]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSetupDashboard = useCallback(async () => {
    if (pilotRecordId == null) return;
    const ids = [...selectedIds];
    if (pilotRestaurantId != null && !ids.includes(pilotRestaurantId)) {
      ids.push(pilotRestaurantId);
    }
    if (ids.length < 1) {
      setSetupError("Select at least one restaurant to track.");
      return;
    }
    setSetupError(null);
    setSetupLoadingOpen(true);
    try {
      await createCompetitorSet({
        pilot_restaurant_id: pilotRecordId,
        restaurant_ids: ids,
      });
      router.push("/dashboard");
    } catch (e) {
      setSetupError(e.message || "Could not create competitor set");
    } finally {
      setSetupLoadingOpen(false);
    }
  }, [pilotRecordId, pilotRestaurantId, router, selectedIds]);

  return (
    <div className="min-h-screen bg-[#FCF9F1] text-black">
      <DashboardSetupLoading open={setupLoadingOpen} />
      <header className="border-b border-[#E8E4DC] bg-[#FCF9F1] px-4 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-black sm:text-lg"
            >
              DineIntel
            </Link>
            <div
              className="flex w-24 gap-1 sm:w-28"
              role="img"
              aria-label="Step 2 of 3"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 1 ? "bg-[#FFD700]" : "bg-[#E5E2D8]"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                Step 2 of 3
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Identify Your Competitors
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-base">
                {pilotName ? (
                  <>
                    Suggested venues near{" "}
                    <span className="font-semibold text-black">{pilotName}</span>.
                    Choose who to track in your active set.
                  </>
                ) : (
                  "Loading your pilot context…"
                )}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <p className="text-xs text-[#666666] lg:text-right">
                Recommended selection:{" "}
                <span className="font-semibold text-black">3–10 venues</span>
              </p>
              <button
                type="button"
                onClick={handleSetupDashboard}
                disabled={setupLoadingOpen || pilotRecordId == null}
                className="inline-flex items-center justify-center rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 sm:whitespace-nowrap"
              >
                Set up my dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-6">
        {loadError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </p>
        ) : null}
        {setupError ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {setupError}
          </p>
        ) : null}

        {suggestionsLoading && !loadError ? (
          <ApiLoader message="Loading suggested competitors…" size="page" className="min-h-[45vh]" />
        ) : null}

        {!suggestionsLoading || loadError ? (
        <>
        <div className="flex flex-col gap-3 rounded-xl border border-[#D8D4CA] bg-[#F5F2E9] p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-2 sm:pr-2">
          <div className="relative min-h-[48px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[#888888]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter suggested venues by name or area…"
              className="h-12 w-full rounded-lg border border-[#E0DDD4] bg-white pl-10 pr-4 text-sm text-black outline-none placeholder:text-[#9CA3AF] focus:border-[#C4BFB2] focus:ring-2 focus:ring-[#FFD700]/30 sm:h-11"
              aria-label="Filter suggestions"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {filtered.map((c) => (
            <CompetitorCard
              key={c.restaurant_id}
              competitor={c}
              selected={selectedIds.has(c.restaurant_id)}
              onToggle={toggle}
            />
          ))}

          <Link
            href="/add-competitor"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C4BFB2] bg-[#FCF9F1] px-6 py-8 text-center transition-colors hover:border-[#9C968A] hover:bg-[#F8F5ED]"
          >
            <span className="flex size-12 items-center justify-center rounded-full border-2 border-[#666666] text-2xl font-light text-[#666666]">
              +
            </span>
            <p className="mt-4 text-base font-bold text-black">Missing someone?</p>
            <p className="mt-2 max-w-xs text-sm text-[#666666]">
              Search the directory and add them to your active competitor set.
            </p>
            <span className="mt-4 text-sm font-bold text-[#B8860B]">Add venue</span>
          </Link>
        </div>

        {!loadError && !suggestionsLoading && suggestions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#666666]">
            No suggestions returned for this pilot. You can still add venues from{" "}
            <Link href="/add-competitor" className="font-semibold underline">
              Add competitor
            </Link>
            .
          </p>
        ) : null}

        {filtered.length === 0 && suggestions.length > 0 ? (
          <p className="mt-8 text-center text-sm text-[#666666]">
            No venues match your filter.
          </p>
        ) : null}
        </>
        ) : null}
      </div>
    </div>
  );
}
