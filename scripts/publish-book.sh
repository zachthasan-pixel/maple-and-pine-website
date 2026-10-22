#!/bin/bash
# publish-book.sh — add a book and push it live
#
# Wraps add-book.mjs with the git commit + push so the full pipeline
# runs in one step:
#
#   ./scripts/publish-book.sh --asin B0XXXXXXXXX --list policy
#   ./scripts/publish-book.sh --asin B0XXXXXXXXX --list fiction --featured
#
# What happens:
#   1. Runs add-book.mjs (scrapes Amazon, updates catalog.json, downloads cover)
#   2. Commits the changes
#   3. Pushes to GitHub
#   4. MPP site (Cloudflare) rebuilds automatically on push
#   5. Author site rebuild is dispatched by the on-catalog-change Action
#
# Both sites update within a few minutes.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "═══ Adding book to catalogue ═══"
node scripts/add-book.mjs "$@"

echo ""
echo "═══ Committing and pushing ═══"

# Stage catalogue and any new covers
git add catalog/

# Extract title for commit message
TITLE=$(git diff --cached catalog/catalog.json | grep '+"title"' | head -1 | sed 's/.*: "//;s/",$//')
if [ -z "$TITLE" ]; then
  TITLE="new book"
fi

git commit -m "Add ${TITLE} to catalogue"
git push

echo ""
echo "═══ Done ═══"
echo "Both sites will rebuild automatically within a few minutes."
