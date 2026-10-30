#!/usr/bin/env bash
# Library -> site: pull the library export, check every stay, regenerate the
# content files the pages read, then test and build. Run by
# .github/workflows/library-sync.yml; locally: EXPORT=path/to/export.json scripts/sync-library.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/library-split.py "${EXPORT:-data/library/export.json}"
python3 scripts/stay-qa.py data/library/stays.json data/library/destinations.json
python3 scripts/export-stays.py data/library/stays.json data/library/destinations.json lib/content/stays.json
python3 scripts/export-countries.py data/library/destinations.json
python3 scripts/export-offers.py data/library/offers.json lib/content/offers/library.json
python3 scripts/export-films.py data/library/films.json lib/content/films.json
python3 scripts/export-impact.py data/library/impact-notes.json lib/content/pathways/impact-library.json
node scripts/build-country-charts.cjs
python3 scripts/build-redirects.py > /dev/null
echo "content regenerated"
