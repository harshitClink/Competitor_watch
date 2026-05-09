"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChefHat,
  Coffee,
  Crosshair,
  MapPin,
  MousePointer2,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import {
  nearbyRecommendations,
  trackedCompetitors,
  trackedMeta,
} from "@/mocks/add-competitor";

function TrackedIcon({ type }) {
  if (type === "coffee") {
    return <Coffee className="size-5 text-[#5C6B47]" aria-hidden />;
  }
  if (type === "chef") {
    return <ChefHat className="size-5 text-[#5C6B47]" aria-hidden />;
  }
  return <UtensilsCrossed className="size-5 text-[#5C6B47]" aria-hidden />;
}

export function AddCompetitorPage() {
  const [query, setQuery] = useState("");

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
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by restaurant name, cuisine, or location..."
            className="w-full rounded-2xl border border-[#E5E0D6] bg-white py-4 pl-12 pr-4 text-[15px] text-[#2D2926] shadow-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#FFD700]/25"
            aria-label="Search restaurants"
          />
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#6B7280]">
            Enter at least 3 characters to find establishments globally.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6B47] hover:underline"
          >
            <MousePointer2 className="size-3.5" aria-hidden />
            Can&apos;t find it? Enter details manually
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <MapPin className="size-5 text-[#5C6B47]" aria-hidden />
            Nearby recommendations
          </h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Based on your main location
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyRecommendations.map((r) => (
            <article
              key={r.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DC] bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 p-4 pb-2">
                <span className="rounded-md bg-[#E8DCC8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3D2E26]">
                  {r.category}
                </span>
                <button
                  type="button"
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFD700] text-black shadow-sm transition-opacity hover:opacity-90"
                  aria-label={`Add ${r.name}`}
                >
                  <Plus className="size-5 stroke-[2.5]" />
                </button>
              </div>
              <div className="px-4">
                <h3 className="text-lg font-bold">{r.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#666666]">
                  <Crosshair className="size-3.5 shrink-0 text-[#9CA3AF]" aria-hidden />
                  {r.rating} Rating • {r.distance}
                </p>
              </div>
              <div className="relative mx-4 mt-3 aspect-[16/10] overflow-hidden rounded-xl bg-[#F0EBE3]">
                <Image
                  src={r.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#EFEBE4] px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">
                  Price: {r.price}
                </span>
                <span className={`text-xs ${r.footerClass}`}>{r.footerLabel}</span>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-[#D8D0C4] bg-[#ECE6DC] p-5 shadow-inner sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">{trackedMeta.title}</h2>
              <p className="mt-1 text-sm text-[#666666]">{trackedMeta.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-[#93C5FD]", "bg-[#FCA5A5]", "bg-[#86EFAC]"].map((bg, i) => (
                  <span
                    key={i}
                    className={`inline-flex size-9 items-center justify-center rounded-full border-2 border-[#ECE6DC] text-xs font-bold text-white ${bg}`}
                    aria-hidden
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-[#9CA3AF] bg-white text-xs font-bold text-[#666666]">
                {trackedMeta.avatarOverflow}
              </span>
              <button
                type="button"
                className="rounded-xl border border-[#C4B8A8] bg-white px-4 py-2 text-xs font-bold text-[#2D2926] shadow-sm hover:bg-[#FAFAF7]"
              >
                Manage all
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
            {trackedCompetitors.map((t) => (
              <div
                key={t.id}
                className="flex min-w-[140px] flex-1 flex-col rounded-xl border border-[#E0D8CC] bg-white p-4 shadow-sm sm:min-w-[160px]"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#F5F0E8]">
                  <TrackedIcon type={t.icon} />
                </div>
                <p className="mt-3 text-sm font-bold">{t.name}</p>
                <span
                  className={`mt-2 inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${t.statusClass}`}
                >
                  {t.status}
                </span>
              </div>
            ))}
            <button
              type="button"
              className="flex min-w-[140px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#BFB5A4] bg-white/60 p-4 text-center transition-colors hover:bg-white sm:min-w-[160px]"
            >
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-[#9CA3AF] text-[#666666]">
                <Plus className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-[#666666]">New slot</p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
