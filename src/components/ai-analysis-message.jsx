import { Check, Crown } from "lucide-react";
import { staticAiAnalysis } from "@/mocks/ai-chat-static-response";

export function AiAnalysisMessage() {
  const d = staticAiAnalysis;

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
          {d.sectionLabel}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#2D2926] sm:text-[15px]">
          {d.body}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {d.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl bg-[#F5F2E9] px-3 py-3 sm:px-4 sm:py-3.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#888888]">
                {m.label}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold text-[#2D2926]">{m.value}</span>
                {m.delta ? (
                  <span className={`text-sm font-semibold ${m.deltaClass}`}>{m.delta}</span>
                ) : null}
                {m.badge ? (
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m.badgeClass}`}
                  >
                    {m.badge}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <hr className="my-5 border-[#EFEBE4]" />

        <div className="flex items-center gap-2">
          <Check className="size-5 text-[#D4AF37]" strokeWidth={2.5} aria-hidden />
          <h3 className="text-base font-bold text-[#2D2926]">{d.recommendationsTitle}</h3>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {d.recommendations.map((rec) => (
            <li
              key={rec.n}
              className="flex gap-3 rounded-xl bg-[#F5F2E9] p-3 sm:p-4"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold ${
                  rec.variant === "gold"
                    ? "bg-[#D4AF37] text-[#2D2926]"
                    : "bg-[#C4C4C4] text-[#2D2926]"
                }`}
              >
                {rec.n}
              </span>
              <p className="text-sm leading-relaxed text-[#2D2926]">{rec.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
