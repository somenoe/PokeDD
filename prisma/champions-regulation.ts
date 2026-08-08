export const REGULATION_SLUG = "reg-m-b";
export const REGULATION_NAME = "Regulation M-B";
export const REGULATION_SOURCE_URL = "https://news.pokemon-home.com/en/page/776.html";
export const REGULATION_VALID_FROM = new Date("2026-06-17T02:00:00.000Z");
export const REGULATION_VALID_TO = new Date("2026-09-09T01:59:00.000Z");

export type OfficialPokemon = {
  id: string;
  name: string;
};

const OFFICIAL_FORM_SLUGS: Record<string, string> = {
  "0026-001": "raichu-alola",
  "0038-001": "ninetales-alola",
  "0059-001": "arcanine-hisui",
  "0080-002": "slowbro-galar",
  "0128-001": "tauros-paldea-combat-breed",
  "0128-002": "tauros-paldea-blaze-breed",
  "0128-003": "tauros-paldea-aqua-breed",
  "0157-001": "typhlosion-hisui",
  "0199-001": "slowking-galar",
  "0479-001": "rotom-heat",
  "0479-002": "rotom-wash",
  "0479-003": "rotom-frost",
  "0479-004": "rotom-fan",
  "0479-005": "rotom-mow",
  "0503-001": "samurott-hisui",
  "0571-001": "zoroark-hisui",
  "0618-001": "stunfisk-galar",
  "0666-018": "vivillon",
  "0670-005": "floette-eternal",
  "0678-001": "meowstic-female",
  "0706-001": "goodra-hisui",
  "0711-001": "gourgeist-small",
  "0711-002": "gourgeist-large",
  "0711-003": "gourgeist-super",
  "0713-001": "avalugg-hisui",
  "0724-001": "decidueye-hisui",
  "0745-001": "lycanroc-midnight",
  "0745-002": "lycanroc-dusk",
  "0902-001": "basculegion-female",
};

export function parseOfficialPokemon(html: string): OfficialPokemon[] {
  const match = html.match(/const pokemons\s*=\s*(\[\[[\s\S]*?\]\]);const noPrefix/);
  if (!match) throw new Error("Official Champions roster array was not found");

  const rows = JSON.parse(match[1]) as Array<[unknown, unknown, unknown]>;
  if (rows.length !== 235) {
    throw new Error(`Expected 235 official Regulation M-B Pokemon, found ${rows.length}`);
  }

  const ids = new Set<string>();
  return rows.map(([id, eligible, name]) => {
    if (typeof id !== "string" || !/^\d{4}-\d{3}$/.test(id)) {
      throw new Error(`Invalid official Pokemon ID: ${String(id)}`);
    }
    if (eligible !== 1 || typeof name !== "string" || !name) {
      throw new Error(`Invalid official roster row for ${id}`);
    }
    if (ids.has(id)) throw new Error(`Duplicate official Pokemon ID: ${id}`);
    ids.add(id);
    return { id, name };
  });
}

export function parseMegaNames(html: string, expectedCount: number): string[] {
  const match = html.match(/<h4>([\s\S]*?)<\/h4>/);
  if (!match) throw new Error("Official Mega Evolution list was not found");

  const names = match[1]
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((name) => name.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
    .filter(Boolean);

  if (names.length !== expectedCount || new Set(names).size !== expectedCount) {
    throw new Error(`Expected ${expectedCount} official Mega Evolutions, found ${names.length}`);
  }
  if (names.some((name) => !name.startsWith("Mega "))) {
    throw new Error("Official Mega Evolution list contains an invalid name");
  }
  return names;
}

export function validateRegulationNotice(html: string): void {
  const expectedPeriod = "Wednesday, June 17, 2026, at 02:00 UTC to Wednesday, September 9, 2026, at 01:59 UTC";
  if (!html.includes("Regulation Set M-B") || !html.includes(expectedPeriod)) {
    throw new Error("Official Regulation M-B notice or current duration was not found");
  }
}

export function resolveOfficialRosterSlugs(
  officialPokemon: OfficialPokemon[],
  defaultSlugByDexNo: Map<number, string>,
  knownSlugs: Set<string>,
): Set<string> {
  const resolved = new Set<string>();
  for (const pokemon of officialPokemon) {
    const [dexPart, formPart] = pokemon.id.split("-");
    const dexNo = Number(dexPart);
    const slug = formPart === "000"
      ? defaultSlugByDexNo.get(dexNo)
      : OFFICIAL_FORM_SLUGS[pokemon.id];
    if (!slug || !knownSlugs.has(slug)) {
      throw new Error(`Could not map official Pokemon ${pokemon.id} (${pokemon.name})`);
    }
    if (resolved.has(slug)) {
      throw new Error(`Official Pokemon ${pokemon.id} maps to duplicate slug ${slug}`);
    }
    resolved.add(slug);
  }
  return resolved;
}

export function resolveOfficialMegaSlugs(megaNames: string[], knownSlugs: Set<string>): Set<string> {
  const resolved = new Set<string>();
  for (const name of megaNames) {
    if (name === "Mega Meowstic") {
      for (const slug of ["meowstic-male-mega", "meowstic-female-mega"]) {
        if (!knownSlugs.has(slug)) throw new Error(`Could not map official Mega Evolution ${name}`);
        resolved.add(slug);
      }
      continue;
    }

    const base = name
      .slice("Mega ".length)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const suffixMatch = base.match(/^(.*)-(x|y)$/);
    const slug = suffixMatch
      ? `${suffixMatch[1]}-mega-${suffixMatch[2]}`
      : `${base}-mega`;
    if (!knownSlugs.has(slug)) throw new Error(`Could not map official Mega Evolution ${name} to ${slug}`);
    resolved.add(slug);
  }
  return resolved;
}
