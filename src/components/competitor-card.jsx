import Image from "next/image";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { restaurantImageSrc } from "@/lib/restaurant-image";

function restaurantHref(c) {
  const id = c.restaurant_id ?? c.id;
  return `/competitor/${id}`;
}

export function CompetitorCard({ competitor, selected, onToggle }) {
  const id = competitor.restaurant_id ?? competitor.id;
  const name = competitor.name ?? "—";
  const cuisines = Array.isArray(competitor.primary_cuisines)
    ? competitor.primary_cuisines.join(", ")
    : competitor.category ?? "";
  const ratingRaw = competitor.avg_rating ?? competitor.rating;
  const rating =
    ratingRaw != null && ratingRaw !== ""
      ? Number.parseFloat(String(ratingRaw))
      : null;
  const distanceLabel =
    competitor.distance_km != null && competitor.distance_km !== ""
      ? `${Number(competitor.distance_km).toFixed(2)} km`
      : competitor.distance ?? "—";
  const imageSrc = restaurantImageSrc(
    competitor.image_url ?? competitor.image,
  );

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow ${
        selected
          ? "border-[#FFD700] shadow-[0_0_0_1px_#FFD700]"
          : "border-[#E0DDD4]"
      }`}
    >
      <Link
        href={restaurantHref(competitor)}
        className="block outline-none transition-colors hover:bg-[#FAFAF8]/90 focus-visible:ring-2 focus-visible:ring-[#5C6B47] focus-visible:ring-offset-2"
      >
        <div className="flex gap-3 p-4 sm:p-5">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#F5F2E9] sm:size-16">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-black sm:text-base">{name}</h3>
              {selected ? (
                <span className="rounded bg-[#FFD700] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                  Selected
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#666666] sm:text-[11px]">
              {cuisines || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-[#E8E4DC]">
          <div className="bg-[#F5F2E9] px-4 py-3 text-center sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666]">
              Rating
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-black">
              <Star className="size-3.5 fill-[#FFD700] text-[#FFD700]" aria-hidden />
              {rating != null && !Number.isNaN(rating) ? rating.toFixed(1) : "—"}
            </p>
          </div>
          <div className="bg-[#F5F2E9] px-4 py-3 text-center sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666]">
              Distance
            </p>
            <p className="mt-1 text-sm font-bold text-black">{distanceLabel}</p>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggle(id);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition-colors sm:py-3 sm:text-sm ${
            selected
              ? "bg-black text-white"
              : "border border-black bg-white text-black hover:bg-[#FAFAFA]"
          }`}
        >
          {selected ? (
            <>
              <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              Selected
            </>
          ) : (
            "Add Competitor"
          )}
        </button>
      </div>
    </article>
  );
}
