"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export function DefenseTotalsFilter({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const t = useTranslations("List");

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      className="inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
    >
      <span className="uppercase tracking-wider text-zinc-500">{t("defenseTotalsLabel")}</span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          visible ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            visible ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
      <span>{visible ? t("hideDefenseTotals") : t("showDefenseTotals")}</span>
    </button>
  );
}
