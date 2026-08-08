#!/usr/bin/env bash
# Refresh PokeAPI CSVs, the official Champions regulation roster, and Smogon
# usage stats, then re-import to SQLite. Run monthly (Smogon publishes new
# chaos data around the 1st of each month).
#
#   bash scripts/refresh-data.sh                # full refresh (CSVs + stats)
#   STATS_ONLY=1 bash scripts/refresh-data.sh   # stats + re-import only
#
# ⚠️  The full refresh OVERWRITES data/pokeapi/*.csv from upstream PokeAPI,
#     which DELETES the hand-curated Champions-original Mega forms (Mega
#     Staraptor, the -mega-z forms, etc.) — these do not exist upstream and
#     live only in the local (gitignored) CSVs. Prefer STATS_ONLY=1 for the
#     routine monthly stats bump; only do a full refresh when you are ready to
#     re-curate the Champions forms afterward.
#
# Supports both BSD `date` (macOS) and GNU `date` (Linux/Windows Git Bash).
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p data/pokeapi

PA_BASE="https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv"
REG_MB_NOTICE_URL="https://news.pokemon-home.com/en/page/776.html"
REG_MA_NOTICE_URL="https://news.pokemon-home.com/en/page/751.html"
# Pull Champions usage for BOTH formats — the UI lets the user pick which one
# to view, so we need both dumps on disk.
#   VGC = official doubles (Regulation M-A)
#   BSS = official singles (Regulation M-A)
# Regulation M-B is the active ruleset since 2026-06-16; its first chaos dump
# lands ≈2026-07-01. The importer prefers regmb files and falls back to regma,
# so keeping both here means we grab whichever month/reg Smogon has published.
SMOGON_FORMATS=(
  "gen9championsvgc2026regmb" "gen9championsbssregmb"
  "gen9championsvgc2026regma" "gen9championsbssregma"
)
# 0 gives the best roster / low-usage move-item-spread coverage. 1760 remains
# useful as a compact high-skill fallback if the broad dump is unavailable.
SMOGON_CUTOFFS=("0" "1760")

# ─── 1) PokeAPI CSVs ─────────────────────────────────────────────────────────
if [[ "${STATS_ONLY:-0}" == "1" ]]; then
  echo "→ STATS_ONLY=1 — skipping PokeAPI CSV refresh (preserves hand-curated Champions Mega forms)"
else
echo "⚠️  Full PokeAPI CSV refresh will overwrite hand-curated Champions Mega forms."
echo "    Ctrl-C now and re-run with STATS_ONLY=1 if you only want the stats bump."
echo "→ Refreshing PokeAPI CSVs from $PA_BASE"
PA_FILES=(
  pokemon pokemon_species pokemon_species_names pokemon_stats pokemon_types
  pokemon_abilities pokemon_forms pokemon_form_names pokemon_moves
  abilities ability_names ability_flavor_text ability_prose
  moves move_names move_flavor_text move_effect_prose move_damage_classes
  items item_names item_flavor_text item_prose item_categories
  item_category_prose item_flags item_flag_map
  type_efficacy types type_names languages version_groups
)
fail=0
for f in "${PA_FILES[@]}"; do
  if curl -sfL "$PA_BASE/$f.csv" -o "data/pokeapi/$f.csv"; then
    :
  else
    echo "  ✗ $f.csv — skipped (network or 404)"
    fail=$((fail + 1))
  fi
done
echo "  PokeAPI: $((${#PA_FILES[@]} - fail))/${#PA_FILES[@]} files OK"
fi

# ─── 2) Official Champions regulation ───────────────────────────────────────
echo "→ Refreshing official Pokémon Champions Regulation M-B roster"

fetch_official_html() {
  local url="$1"
  local target="$2"
  local marker="$3"
  if curl -sfL --connect-timeout 10 --max-time 60 "$url" -o "$target.tmp" \
    && grep -Fq "$marker" "$target.tmp"; then
    mv "$target.tmp" "$target"
  else
    rm -f "$target.tmp"
    echo "  ✗ official source failed validation: $url"
    return 1
  fi
}

fetch_official_html "$REG_MB_NOTICE_URL" "data/pokeapi/champions-regulation-reg-m-b.html" "Regulation Set M-B"
fetch_official_html "$REG_MA_NOTICE_URL" "data/pokeapi/champions-regulation-reg-m-a.html" "Regulation Set M-A"

roster_url="$(grep -oE 'https://web-view\.app\.pokemonchampions\.jp/[^\"<]+/pokemon\.html' data/pokeapi/champions-regulation-reg-m-b.html | head -n 1)"
if [[ -z "$roster_url" ]]; then
  echo "  ✗ official Eligible Pokémon URL was not found in the M-B notice"
  exit 1
fi
fetch_official_html "$roster_url" "data/pokeapi/champions-roster-reg-m-b.html" "const pokemons ="
echo "  Official roster: ✓ downloaded from $roster_url"

# ─── 3) Smogon Champions stats ──────────────────────────────────────────────
# The chaos dump for a given month is usually published 1-3 days into the next
# month. Try the current month first; fall back to the last two months.
months=()
months+=("$(date +%Y-%m)")
if date -v-1m +%Y-%m >/dev/null 2>&1; then
  months+=("$(date -v-1m +%Y-%m)")
  months+=("$(date -v-2m +%Y-%m)")
else
  months+=("$(date -d '-1 month' +%Y-%m)")
  months+=("$(date -d '-2 months' +%Y-%m)")
fi

for fmt in "${SMOGON_FORMATS[@]}"; do
  # Derive the on-disk filename suffix from the format identifier; strips the
  # "gen9" prefix and "2026" version chunk so VGC and BSS produce different files.
  short="${fmt#gen9}"
  short="${short//vgc2026/vgc2026}"  # no-op, kept for clarity
  for cutoff in "${SMOGON_CUTOFFS[@]}"; do
    target="data/pokeapi/smogon-${short}-${cutoff}.json"
    got=""
    for m in "${months[@]}"; do
      url="https://www.smogon.com/stats/$m/chaos/${fmt}-${cutoff}.json"
      echo "  trying $m $fmt cutoff $cutoff..."
      if curl -sfL --connect-timeout 5 --max-time 15 "$url" -o "$target.tmp"; then
        mv "$target.tmp" "$target"
        got="$m"
        break
      fi
      rm -f "$target.tmp"
    done

    if [[ -z "$got" ]]; then
      echo "  ✗ no $fmt chaos JSON for cutoff $cutoff in the last 3 months — skipping"
      continue
    fi
    echo "  Smogon stats: ✓ using $got/$fmt-$cutoff.json ($(du -h "$target" | cut -f1))"
  done
done

# ─── 4) Reimport into SQLite ─────────────────────────────────────────────────
echo "→ Re-importing to SQLite..."
npm run db:import

echo "✓ Done. Next run: in about a month, when Smogon publishes a new chaos dump."
