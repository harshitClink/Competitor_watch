"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { mockCompetitors } from "@/mocks/competitors";
import { CompetitorCard } from "@/components/competitor-card";
import { DashboardSetupLoading } from "@/components/dashboard-setup-loading";

const PIN_POSITIONS = [
  { top: "18%", left: "22%" },
  { top: "28%", left: "38%" },
  { top: "22%", left: "55%" },
  { top: "35%", left: "68%" },
  { top: "48%", left: "30%" },
  { top: "52%", left: "48%" },
  { top: "45%", left: "72%" },
  { top: "62%", left: "25%" },
  { top: "58%", left: "58%" },
  { top: "68%", left: "42%" },
  { top: "72%", left: "65%" },
  { top: "40%", left: "82%" },
];

function MapPinMarker({ style }) {
  return (
    <span
      className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-full sm:size-4"
      style={style}
      aria-hidden
    >
      <svg viewBox="0 0 24 32" className="h-full w-full drop-shadow-md">
        <path
          fill="#FFD700"
          d="M12 0C5.4 0 0 5.2 0 11.6c0 8.4 12 20.4 12 20.4s12-12 12-20.4C24 5.2 18.6 0 12 0z"
        />
        <circle cx="12" cy="11" r="4" fill="#1a1a1a" opacity="0.25" />
      </svg>
    </span>
  );
}

export function CompetitorSelection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [setupLoadingOpen, setSetupLoadingOpen] = useState(false);
  const [setupLoadId, setSetupLoadId] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => {
    const initial = new Set();
    mockCompetitors.forEach((c) => {
      if (c.initiallySelected) initial.add(c.id);
    });
    return initial;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCompetitors;
    return mockCompetitors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSetupComplete = useCallback(() => {
    setSetupLoadingOpen(false);
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FCF9F1] text-black">
      <DashboardSetupLoading
        key={setupLoadId}
        open={setupLoadingOpen}
        onComplete={handleSetupComplete}
      />
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
              aria-label="Step 2 of 4"
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 2 ? "bg-[#FFD700]" : "bg-[#E5E2D8]"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                Step 2 of 4
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Identify Your Competitors
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-base">
                DineIntel has identified these venues based on your location and
                menu profile. Select the ones you want to track for competitive
                analysis.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <p className="text-xs text-[#666666] lg:text-right">
                Recommended selection:{" "}
                <span className="font-semibold text-black">5–8 venues</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setSetupLoadId((n) => n + 1);
                  setSetupLoadingOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-95 sm:whitespace-nowrap"
              >
                Set up my dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-6">
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
              placeholder="Search for a specific restaurant by name or address..."
              className="h-12 w-full rounded-lg border border-[#E0DDD4] bg-white pl-10 pr-4 text-sm text-black outline-none placeholder:text-[#9CA3AF] focus:border-[#C4BFB2] focus:ring-2 focus:ring-[#FFD700]/30 sm:h-11"
              aria-label="Search competitors"
            />
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E0DDD4] bg-white px-4 py-2.5 text-xs font-semibold text-black sm:flex-initial sm:py-2"
            >
              <SlidersHorizontal className="size-4 text-[#666666]" aria-hidden />
              Cuisine
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E0DDD4] bg-white px-4 py-2.5 text-xs font-semibold text-black sm:flex-initial sm:py-2"
            >
              <MapPin className="size-4 text-[#666666]" aria-hidden />
              Radius
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {filtered.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              selected={selectedIds.has(c.id)}
              onToggle={toggle}
            />
          ))}

          <button
            type="button"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C4BFB2] bg-[#FCF9F1] px-6 py-8 text-center transition-colors hover:border-[#9C968A] hover:bg-[#F8F5ED]"
          >
            <span className="flex size-12 items-center justify-center rounded-full border-2 border-[#666666] text-2xl font-light text-[#666666]">
              +
            </span>
            <p className="mt-4 text-base font-bold text-black">Missing someone?</p>
            <p className="mt-2 max-w-xs text-sm text-[#666666]">
              Manually add any venue by name.
            </p>
            <span className="mt-4 text-sm font-bold text-[#B8860B]">
              Add Custom Venue
            </span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#666666]">
            No venues match your search.
          </p>
        ) : null}

        <section
          className="relative mt-10 overflow-hidden rounded-xl border border-[#2A2825] bg-[#3D3A36] shadow-inner"
          aria-label="Market map preview"
        >
          <div className="relative aspect-[21/9] min-h-[220px] w-full sm:min-h-[280px]">
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=60"
              alt=""
              fill
              className="object-cover opacity-45 grayscale"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#2C2A26]/75" />
            {PIN_POSITIONS.map((pos, i) => (
              <MapPinMarker
                key={i}
                style={{ top: pos.top, left: pos.left }}
              />
            ))}

            <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3 py-2 shadow-md sm:left-4 sm:top-4 sm:gap-3 sm:px-4">
              <MapPin className="size-4 shrink-0 text-[#666666]" aria-hidden />
              <span className="truncate text-xs font-semibold text-black sm:text-sm">
                Downtown Intelligence District
              </span>
              <span className="hidden h-4 w-px bg-[#D0D0D0] sm:block" aria-hidden />
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-[#666666] sm:inline">
                12 active trackers
              </span>
            </div>

            <div className="absolute bottom-3 right-3 rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 shadow-md sm:bottom-4 sm:right-4 sm:px-4 sm:py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#666666]">
                Legend
              </p>
              <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-black">
                <div className="flex items-center gap-2">
                  <span className="size-3 shrink-0 rounded-sm bg-[#FFD700]" />
                  Selected
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 shrink-0 rounded-sm border border-[#CCC] bg-white" />
                  Suggested
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
