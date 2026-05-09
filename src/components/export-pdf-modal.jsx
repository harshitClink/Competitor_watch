"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  Calendar,
  Check,
  Download,
  LineChart,
  Users,
  UtensilsCrossed,
} from "lucide-react";

const SECTIONS = [
  {
    id: "menuActivity",
    label: "Menu activity",
    icon: UtensilsCrossed,
    defaultOn: true,
  },
  {
    id: "sentimentTrend",
    label: "Sentiment trend",
    icon: LineChart,
    defaultOn: true,
  },
  {
    id: "priceBand",
    label: "Price band",
    icon: Banknote,
    defaultOn: true,
  },
  {
    id: "competitorFootfall",
    label: "Competitor footfall",
    icon: Users,
    defaultOn: false,
  },
];

export function ExportPdfModal({ open, onClose }) {
  const [sections, setSections] = useState(() =>
    SECTIONS.reduce(
      (acc, s) => {
        acc[s.id] = s.defaultOn;
        return acc;
      },
      {},
    ),
  );
  const [startDate, setStartDate] = useState("2023-10-01");
  const [endDate, setEndDate] = useState("2023-10-31");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleSection = useCallback((id) => {
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#6B6B6B]/60 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-h-[88vh] lg:flex-row"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-pdf-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-b border-[#E8E4DC] p-6 sm:p-8 lg:max-w-[50%] lg:border-b-0 lg:border-r">
          <h2 id="export-pdf-title" className="text-xl font-bold text-[#2D2926]">
            Export PDF
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            Customize your competitive intelligence report.
          </p>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            Report sections
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {SECTIONS.map((s) => {
              const on = sections[s.id];
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      on
                        ? "border-[#D4D0C8] bg-white shadow-sm"
                        : "border-[#E8E4DC] bg-[#FAFAF8] text-[#666666]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 ${
                          on
                            ? "border-[#5C6B47] bg-[#5C6B47] text-white"
                            : "border-[#D0CBC2] bg-white"
                        }`}
                      >
                        {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                      </span>
                      {s.label}
                    </span>
                    <Icon className="size-5 shrink-0 text-[#666666]" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            Date range
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide text-[#888888]">
                Start date
              </label>
              <div className="relative mt-1">
                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E0DDD4] bg-white py-2.5 pl-3 pr-10 text-sm text-[#2D2926] outline-none focus:border-[#5C6B47]/40 focus:ring-2 focus:ring-[#5C6B47]/15"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide text-[#888888]">
                End date
              </label>
              <div className="relative mt-1">
                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E0DDD4] bg-white py-2.5 pl-3 pr-10 text-sm text-[#2D2926] outline-none focus:border-[#5C6B47]/40 focus:ring-2 focus:ring-[#5C6B47]/15"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-3 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-95"
            >
              <Download className="size-4" aria-hidden />
              Generate Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E0DDD4] bg-white px-6 py-3 text-sm font-semibold text-[#2D2926] hover:bg-[#FAFAF7] sm:shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col bg-[#F0EBE3] p-6 sm:p-8 lg:w-[50%] lg:max-w-[50%]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
            Report preview
          </p>

          <div className="mt-4 flex flex-1 flex-col rounded-xl border border-[#E0D8CC] bg-white p-4 shadow-inner">
            <div className="flex items-center gap-2 border-b border-[#EFEBE4] pb-3">
              <span className="size-6 rounded bg-[#2D2926]" aria-hidden />
              <div className="flex flex-1 flex-col gap-1">
                <span className="h-2 w-3/4 max-w-[180px] rounded bg-[#E8E4DC]" />
                <span className="h-1.5 w-1/2 max-w-[120px] rounded bg-[#F0EBE3]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#FAFAF7] p-3">
                <span className="mb-2 block h-2 w-2/3 rounded bg-[#E0DDD4]" />
                <span className="mb-1 block h-1.5 w-full rounded bg-[#F5F2E9]" />
                <span className="block h-1.5 w-4/5 rounded bg-[#F5F2E9]" />
              </div>
              <div className="rounded-lg bg-[#FAFAF7] p-3">
                <span className="mb-2 block h-2 w-1/2 rounded bg-[#E0DDD4]" />
                <span className="mb-1 block h-1.5 w-full rounded bg-[#F5F2E9]" />
                <span className="block h-1.5 w-3/4 rounded bg-[#F5F2E9]" />
              </div>
            </div>
            <div className="mt-4 flex h-24 items-end gap-1 sm:h-28">
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[#FFD700]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#666666]">
            Preview reflects the selected sections for{" "}
            <span className="font-semibold text-[#2D2926]">DineIntel Analyst Edition</span>.
          </p>
          <div className="mt-4 flex justify-center">
            <span
              className="size-8 rounded-md bg-[#2D2926]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
