import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { POKEMON_TYPES, type PokemonType } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { PokemonListClient } from "./PokemonListClient";

export const dynamic = "force-dynamic";

type Sort =
  | "dex" | "name" | "usage" | "hp" | "atk" | "def" | "spa" | "spd" | "spe" | "bst";

type ParsedSearch = {
  type?: string;
  q?: string;
  mega?: string;
  sort: Sort;
  dir?: "asc" | "desc";
};

function parseSearch(raw: Record<string, string | string[] | undefined>): ParsedSearch {
  const get = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const sort = (get("sort") as Sort) ?? "dex";
  const dir = get("dir") === "desc" ? "desc" : get("dir") === "asc" ? "asc" : undefined;
  return { type: get("type"), q: get("q"), mega: get("mega"), sort, dir };
}

const SORT_TO_FIELD: Record<Sort, string> = {
  dex: "dexNo",
  name: "name",
  usage: "usagePct",
  hp: "hp", atk: "atk", def: "def", spa: "spa", spd: "spd", spe: "spe",
  bst: "bst",
};

export default async function PokemonListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("List");
  const sp = parseSearch(await searchParams);
  const selectedTypes = (sp.type ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is PokemonType => (POKEMON_TYPES as readonly string[]).includes(s));
  const sort = sp.sort;
  const dir = sp.dir ?? (sort === "name" || sort === "dex" ? "asc" : "desc");
  const orderBy = sort === "bst" ? undefined : { [SORT_TO_FIELD[sort]]: dir as "asc" | "desc" };

  const where: Record<string, unknown> = {
    // Mega filtering is intentionally client-side so the toggle never waits for a server navigation.
    games: { contains: '"pokemon-champions"' },
  };
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { nameI18n: { contains: sp.q } },
      { slug: { contains: sp.q } },
    ];
  }
  if (selectedTypes.length > 0) {
    where.AND = selectedTypes.map((tp) => ({
      OR: [{ type1: tp }, { type2: tp }],
    }));
  }

  let pokemon = await prisma.pokemon.findMany({
    where,
    orderBy,
    select: {
      id: true, slug: true, dexNo: true, name: true, nameI18n: true,
      type1: true, type2: true, hp: true, atk: true, def: true,
      spa: true, spd: true, spe: true, spriteUrl: true, usagePct: true,
    },
  });
  if (sort === "bst") {
    pokemon = pokemon
      .map((p) => ({ ...p, _bst: p.hp + p.atk + p.def + p.spa + p.spd + p.spe }))
      .sort((a, b) => (dir === "asc" ? a._bst - b._bst : b._bst - a._bst));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t("title")}</h1>
        <form className="flex gap-2" action={`/${locale === "en" ? "" : locale + "/"}pokemon-champions/pokemon`}>
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder={t("search")}
            className="w-56 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {selectedTypes.length > 0 ? <input type="hidden" name="type" value={selectedTypes.join(",")} /> : null}
          {sort !== "dex" ? <input type="hidden" name="sort" value={sort} /> : null}
          {dir !== "asc" ? <input type="hidden" name="dir" value={dir} /> : null}
          {sp.mega === "hide" ? <input type="hidden" name="mega" value="hide" /> : null}
        </form>
      </div>
      <PokemonListClient
        pokemon={pokemon}
        locale={locale as Locale}
        selectedTypes={selectedTypes}
        initialMegaHidden={sp.mega === "hide"}
        sort={sort}
        dir={dir}
      />
    </main>
  );
}
