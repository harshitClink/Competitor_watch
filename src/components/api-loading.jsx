"use client";

import { Loader2 } from "lucide-react";

/**
 * Accessible loading indicator for API fetches.
 * @param {{ message?: string, size?: "page" | "section" | "inline" | "compact", className?: string }} props
 */
export function ApiLoader({
  message = "Loading…",
  size = "section",
  className = "",
}) {
  const isCompact = size === "compact";
  const isPage = size === "page";
  const isInline = size === "inline";

  const iconClass = isPage
    ? "size-11"
    : isInline
      ? "size-6"
      : isCompact
        ? "size-5"
        : "size-9";

  const boxClass = isPage
    ? "min-h-[50vh] gap-4 py-16"
    : isInline
      ? "gap-2 py-6"
      : isCompact
        ? "flex-row gap-3 py-6"
        : "min-h-[200px] gap-3 py-12";

  const textClass =
    isCompact || isInline ? "text-sm text-[#6B7280]" : "text-sm font-medium text-[#6B7280]";

  return (
    <div
      className={`flex items-center justify-center text-[#2D2926] ${isCompact ? "flex-row" : "flex-col"} ${boxClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={`${iconClass} shrink-0 animate-spin text-[#5C6B47]`} aria-hidden />
      <p className={textClass}>{message}</p>
    </div>
  );
}
