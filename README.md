# Maple & Pine Press — website

Live at **https://mapleandpinepress.com**. A push to `main` rebuilds and publishes the
site automatically through Cloudflare, so anything committed here goes live within a
few minutes.

## What is where

- `catalog/catalog.json` — the single list of every Maple & Pine Press title. This site
  reads it directly, and **drzahirhasan.com** is rebuilt from the same file every night.
  A new book is added here, once, and both sites pick it up. `catalog/README.md`
  explains every field.
- `app/` — the website itself (TanStack Start, TypeScript, built with Bun and Vite,
  served as a Cloudflare Worker).
  - `app/src/routes/` — one file per page: home, books, a page per book, about,
    submissions, Beyond the Press, the publishing toolkit, and Today's Paper.
  - `app/public/assets/covers/` — cover pictures, 900 pixels wide, named after the slug.
  - `app/public/paper/` — the daily paper: `editions.json` plus a PDF and picture per
    edition. The `/paper` page reads `editions.json` in the browser.
  - `app/wrangler.deploy.jsonc` — the Cloudflare settings used for the live site.
- `scripts/` — the tools that keep the site current (below).
- `refs/` — design reference pictures.

## Everyday jobs

**Add a book** (from its Amazon code):

    ./scripts/publish-book.sh --asin B0XXXXXXXXX --list policy

This reads the Amazon page, adds the entry to the catalogue, fetches the cover,
commits and pushes. Lists are `policy`, `practice`, `fiction` and `kids`. To check the
result before it goes live, run `node scripts/add-book.mjs --asin ... --dry-run`.

**Publish a new edition of the paper:** `scripts/publish-paper.py` (see the notes at
the top of that file). No code changes are needed for a new edition.

## Working on the site itself

    cd app
    bun install
    bun run dev        # local preview
    bun run typecheck
    bun run build

Every push to `main` also runs these checks on GitHub (`.github/workflows/ci.yml`).

## The other half

The author site lives in the `zachthasan-pixel.github.io` repository. It copies
`catalog/catalog.json` from here each night and rebuilds its own book pages, so the two
sites never drift apart.
