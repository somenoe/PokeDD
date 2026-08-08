"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TypeChip } from "@/components/TypeChip";
import type { Locale } from "@/i18n/routing";
import { localizedPokemonName } from "@/lib/i18n-pokemon";
import { type PokemonType } from "@/lib/types";
import { MegaFilter } from "./MegaFilter";
import { SortHeader } from "./SortHeader";
import { TypeFilters } from "./TypeFilters";
import { useState } from "react";

export type PokemonListRow = {
  id: number;
  slug: string;
  dexNo: number;
  name: string;
  nameI18n: string;
  type1: string;
  type2: string | null;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  spriteUrl: string;
  usagePct: number;
};

type Sort =
  | "dex" | "name" | "usage" | "hp" | "atk" | "def" | "spa" | "spd" | "spe"
  | "bst" | "total_defends" | "total_defends_and_hp";

export function PokemonListClient({
  pokemon,
  locale,
  selectedTypes,
  initialMegaHidden,
  sort,
  dir,
}: {
  pokemon: PokemonListRow[];
  locale: Locale;
  selectedTypes: PokemonType[];
  initialMegaHidden: boolean;
  sort: Sort;
  dir: "asc" | "desc";
}) {
  const t = useTranslations("List");
  const cols = useTranslations("List.columns");
  const [megaHidden, setMegaHidden] = useState(initialMegaHidden);
  const visiblePokemon = megaHidden ? pokemon.filter((p) => !p.slug.includes("-mega")) : pokemon;

  function toggleMega() {
    const nextHidden = !megaHidden;
    setMegaHidden(nextHidden);
    const url = new URL(window.location.href);
    if (nextHidden) url.searchParams.set("mega", "hide");
    else url.searchParams.delete("mega");
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <p className="mt-1 text-sm text-zinc-500">
        {t("subtitle", { count: visiblePokemon.length })}
      </p>

      <div className="mt-4">
        <MegaFilter hidden={megaHidden} onToggle={toggleMega} />
      </div>

      <TypeFilters selected={selectedTypes} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2 text-left">{cols("dex")}</th>
              <th className="px-3 py-2 text-left">{cols("sprite")}</th>
              <SortHeader sort={sort} dir={dir} field="name" label={cols("name")} align="left" />
              <th className="px-3 py-2 text-left">{cols("types")}</th>
              <SortHeader sort={sort} dir={dir} field="usage" label={cols("usage")} />
              <SortHeader sort={sort} dir={dir} field="hp" label={cols("hp")} />
              <SortHeader sort={sort} dir={dir} field="atk" label={cols("atk")} />
              <SortHeader sort={sort} dir={dir} field="def" label={cols("def")} />
              <SortHeader sort={sort} dir={dir} field="spa" label={cols("spa")} />
              <SortHeader sort={sort} dir={dir} field="spd" label={cols("spd")} />
              <SortHeader sort={sort} dir={dir} field="spe" label={cols("spe")} />
              <SortHeader sort={sort} dir={dir} field="bst" label={cols("bst")} />
              <SortHeader sort={sort} dir={dir} field="total_defends" label={cols("total_defends")} />
              <SortHeader sort={sort} dir={dir} field="total_defends_and_hp" label={cols("total_defends_and_hp")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visiblePokemon.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-zinc-500">
                  {t("empty")} {" "}
                  <Link href="/pokemon-champions/pokemon" className="font-medium underline">
                    {t("clearFilters")}
                  </Link>
                </td>
              </tr>
            ) : null}
            {visiblePokemon.map((p) => {
              const bst = p.hp + p.atk + p.def + p.spa + p.spd + p.spe;
              return (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500">{p.dexNo.toString().padStart(3, "0")}</td>
                  <td className="px-3 py-1"><Image src={p.spriteUrl} alt={p.name} width={48} height={48} className="h-10 w-10 object-contain" /></td>
                  <td className="px-3 py-2">
                    <Link href={`/pokemon-champions/pokemon/${p.slug}`} prefetch={false} className="font-semibold text-zinc-950 hover:text-red-600 dark:text-zinc-50">
                      {localizedPokemonName(p, locale)}
                    </Link>
                  </td>
                  <td className="px-3 py-2"><div className="flex flex-wrap gap-1"><TypeChip type={p.type1 as PokemonType} size="sm" />{p.type2 ? <TypeChip type={p.type2 as PokemonType} size="sm" /> : null}</div></td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.usagePct.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.hp}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.atk}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.def}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.spa}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.spd}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{p.spe}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">{bst}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">{p.def + p.spd}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">{p.hp + p.def + p.spd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
