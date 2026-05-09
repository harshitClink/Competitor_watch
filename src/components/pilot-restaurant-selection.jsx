"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Search } from "lucide-react";
import { mockRestaurants } from "@/mocks/restaurants";

export function PilotRestaurantSelection() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockRestaurants;
    return mockRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  }, []);

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
          <button
            type="button"
            className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1A1A1A]"
          >
            Skip for now
          </button>
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

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            RECENT RESULTS
          </p>

          <div className="mt-2 overflow-hidden rounded-xl bg-[#F5F1E6]">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
                No restaurants match your search.
              </p>
            ) : (
              <ul className="divide-y divide-[#E8E0D4]">
                {filtered.map((r) => {
                  const isSelected = selectedId === r.id;
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
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#D9CFC4] sm:size-11"
                          aria-hidden
                        >
                          <Building2 className="size-[18px] text-[#5C534C] sm:size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#1A1A1A] sm:text-[15px]">
                            {r.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#6B7280] sm:text-sm">
                            {r.location}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 rounded-full border border-[#D4D0C8] bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4B5563] sm:px-2.5 sm:py-1 sm:text-[10px]">
                          {r.status}
                        </span>
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
            <Link
              href="/competitors"
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#FFD700] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-sm transition-opacity hover:opacity-95 sm:py-4 sm:text-base"
            >
              Continue with Selection
            </Link>
          )}

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            <Link
              href="/add-competitor"
              className="font-medium underline-offset-2 hover:text-[#1A1A1A] hover:underline"
            >
              + Can&apos;t find your restaurant? Add it manually
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
