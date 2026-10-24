# The catalogue — one file for both websites

`catalog.json` is the single list of every Maple & Pine Press title. Both websites are
built from it:

- **mapleandpinepress.com** reads it directly (`app/src/components/site/catalog.tsx`).
- **drzahirhasan.com** is generated from it (`scripts/build-site.mjs` in that site's repo).

## Adding a book

Copy one entry, change the words, and put the cover picture in `app/public/assets/covers/`
(900 pixels wide, JPEG, named after the slug). Then rebuild both sites.

## What each field means

| field | meaning |
|---|---|
| `slug` | the short web name, lower-case with hyphens; it becomes the page address |
| `title`, `subtitle` | as on the cover |
| `list` | `policy`, `practice`, `fiction` or `kids` (see `_lists` at the top) |
| `status` | `published` or `forthcoming` |
| `asins` | Amazon codes, ebook first where there are two |
| `description` | the store description, one paragraph per line |
| `cover` | picture file under `app/public/assets/` |
| `coverFit` | `"contain"` for square or landscape covers, otherwise `null` |
| `series` | `{ name, order }` when the book belongs to a series |
| `isbn` | Maple & Pine ISBNs for print editions of new titles (leave `null` for Amazon-assigned ones) |
| `press` | how the book appears on mapleandpinepress.com: its page, category label, home-page shelf |
| `authorSite` | how it appears on drzahirhasan.com: section, one-line blurb, home-page feature, Amazon Japan link |

<!-- Auto-deploy to Cloudflare enabled 2026-10-24: a push to main rebuilds and publishes mapleandpinepress.com. -->
