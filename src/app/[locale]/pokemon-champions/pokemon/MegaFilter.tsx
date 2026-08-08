"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export function MegaFilter({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  const t = useTranslations("List");

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {t("megaLabel")}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!hidden}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
      >
        <span
          aria-hidden
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            hidden ? "bg-zinc-300 dark:bg-zinc-700" : "bg-red-500",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              hidden ? "left-0.5" : "left-[18px]",
            )}
          />
        </span>
        <span>{hidden ? t("showMega") : t("hideMega")}</span>
      </button>
    </div>
  );
}
