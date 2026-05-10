import { Crown } from "lucide-react";
import Link from "next/link";

/**
 * @param {{ content: string, citations?: { restaurant_ids?: number[] }|null }} props
 */
export function AiAnalysisMessage({ content, citations }) {
  const ids = citations?.restaurant_ids;

  return (
    <div className="flex w-full max-w-[min(100%,42rem)] gap-3 sm:gap-4">
      <div
        className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#3D2E26] sm:size-10"
        aria-hidden
      >
        <Crown className="size-4 text-[#D4AF37] sm:size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-[#E5E0D6] bg-white p-4 shadow-sm sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C2A]">
          Assistant
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#2D2926] sm:text-[15px]">
          {content || "—"}
        </p>

        {ids?.length ? (
          <div className="mt-4 rounded-xl border border-[#EFEBE4] bg-[#F5F2E9] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
              Cited restaurants
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {ids.map((rid) => (
                <li key={rid}>
                  <Link
                    href={`/competitor/${rid}`}
                    className="text-sm font-semibold text-[#5C6B47] hover:underline"
                  >
                    #{rid}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
