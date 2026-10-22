#!/usr/bin/env node
/**
 * add-book.mjs — Maple & Pine Press book ingestion script
 *
 * Given an Amazon ASIN (ebook or paperback), this script:
 *   1. Scrapes the Amazon product page for title, author, description, cover
 *   2. Finds the companion format ASIN (ebook ↔ paperback)
 *   3. Downloads the cover image at full resolution
 *   4. Generates a complete catalog.json entry
 *   5. Adds it to catalog.json and saves
 *
 * Usage:
 *   node scripts/add-book.mjs --asin B0XXXXXXXXX --list policy
 *   node scripts/add-book.mjs --asin B0XXXXXXXXX --list fiction --featured
 *   node scripts/add-book.mjs --asin B0XXXXXXXXX --list kids --dry-run
 *
 * Lists: policy | practice | fiction | kids
 *
 * Requires: Node 18+, no dependencies (uses built-in fetch)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CATALOG_PATH = join(ROOT, "catalog", "catalog.json");
const COVERS_DIR = join(ROOT, "catalog", "covers");

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flag(name) {
  return args.includes(`--${name}`);
}
function opt(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}

const ASIN = opt("asin");
const LIST = opt("list");
const DRY_RUN = flag("dry-run");
const FEATURED = flag("featured");
const SUBTITLE = opt("subtitle"); // optional override
const SERIES_NAME = opt("series");

if (!ASIN || !LIST) {
  console.error("Usage: node add-book.mjs --asin <ASIN> --list <policy|practice|fiction|kids> [--dry-run] [--featured] [--subtitle '...'] [--series '...']");
  process.exit(1);
}

const VALID_LISTS = ["policy", "practice", "fiction", "kids"];
if (!VALID_LISTS.includes(LIST)) {
  console.error(`Invalid list "${LIST}". Must be one of: ${VALID_LISTS.join(", ")}`);
  process.exit(1);
}

const LIST_PILLS = {
  policy: "Politics & International Affairs",
  practice: "Education & Practice",
  fiction: "Fantasy & Speculative Fiction",
  kids: "Children's Books",
};

// ─── Amazon scraping ────────────────────────────────────────────────────────
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchAmazonPage(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;
  console.log(`Fetching ${url} ...`);
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Amazon returned ${res.status}`);
  return res.text();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTitle(html) {
  const m = html.match(/<span\s+id="productTitle"[^>]*>([^<]+)<\/span>/);
  if (m) {
    let raw = decodeEntities(m[1].trim());
    return raw;
  }
  // Fallback: page title
  const t = html.match(/<title>Amazon\.com:\s*([^:]+)/);
  return t ? decodeEntities(t[1].trim()) : null;
}

function extractAuthor(html) {
  const m = html.match(/<span\s+class="author[^"]*"[^>]*>.*?<a[^>]*>([^<]+)<\/a>/s);
  return m ? m[1].trim() : null;
}

function extractDescription(html) {
  // Try multiple locations Amazon uses for book descriptions
  const patterns = [
    /<div[^>]*data-feature-name="bookDescription"[^>]*>(.*?)<\/div>\s*<\/div>/s,
    /<div[^>]*id="bookDesc_override_div"[^>]*>(.*?)<\/div>/s,
    /<div[^>]*id="productDescription"[^>]*>(.*?)<\/div>/s,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) {
      // Strip HTML tags, clean up whitespace
      let text = m[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      // Split into paragraphs, strip Amazon UI text
      const paras = text
        .split(/\n{2,}/)
        .map((p) => p.replace(/\s+/g, " ").trim())
        .map((p) => p.replace(/\s*Read more\s*$/i, "").trim())
        .filter(Boolean);
      if (paras.length > 0) return paras;
    }
  }
  return null;
}

function extractCoverUrl(html) {
  // Hi-res image (best quality)
  const m = html.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (m) return m[1];

  // Fallback: landing image
  const m2 = html.match(/<img[^>]*id="(?:imgBlkFront|ebooksImgBlkFront|landingImage)"[^>]*src="([^"]+)"/);
  return m2 ? m2[1] : null;
}

function extractCompanionAsins(html, primaryAsin) {
  // Find all ASINs linked from the page via /dp/ links
  const dpAsins = [...new Set(html.match(/\/dp\/([A-Z0-9]{10})/g) || [])].map((s) =>
    s.replace("/dp/", "")
  );

  // Also check data-asin attributes
  const dataAsins = [...new Set(html.match(/data-asin="([A-Z0-9]{10})"/g) || [])].map((s) =>
    s.replace('data-asin="', "").replace('"', "")
  );

  // Merge and deduplicate, exclude the primary ASIN and common non-book ASINs
  const all = [...new Set([...dpAsins, ...dataAsins])].filter(
    (a) => a !== primaryAsin && a.startsWith("B0")
  );

  // The companion is usually the one with a similar ASIN prefix or on the format switcher
  // For now, return all candidates — the caller picks the right one
  return all;
}

function extractPubDate(html) {
  const m = html.match(/Publication date.*?(\w+\s+\d+,\s*\d{4})/s);
  return m ? m[1].trim() : null;
}

function extractIsbn13(html) {
  // Real ISBN-13s always start with 978 or 979
  const m = html.match(/ISBN-13.*?(97[89]\d{10})/s);
  return m ? m[1] : null;
}

// ─── Cover download ─────────────────────────────────────────────────────────
async function downloadCover(url, slug) {
  if (!existsSync(COVERS_DIR)) mkdirSync(COVERS_DIR, { recursive: true });
  const ext = url.includes(".png") ? "png" : "jpg";
  const filename = `${slug}.${ext}`;
  const filepath = join(COVERS_DIR, filename);

  if (existsSync(filepath)) {
    console.log(`Cover already exists: ${filename}`);
    return `covers/${filename}`;
  }

  console.log(`Downloading cover to ${filename} ...`);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Cover download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
  console.log(`Saved cover: ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return `covers/${filename}`;
}

// ─── Slug generation ────────────────────────────────────────────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(slug, existingSlugs) {
  if (!existingSlugs.has(slug)) return slug;
  let n = 2;
  while (existingSlugs.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// ─── Parse title into title + subtitle ──────────────────────────────────────
function splitTitle(fullTitle) {
  // Amazon often formats as "Title: Subtitle" or "Title — Subtitle"
  const separators = [": ", " — ", " - "];
  for (const sep of separators) {
    const idx = fullTitle.indexOf(sep);
    if (idx > 0 && idx < fullTitle.length - sep.length) {
      return {
        title: fullTitle.slice(0, idx).trim(),
        subtitle: fullTitle.slice(idx + sep.length).trim(),
      };
    }
  }
  return { title: fullTitle, subtitle: null };
}

// ─── Determine cover fit ────────────────────────────────────────────────────
// Children's books often have square or landscape covers that need "contain"
async function shouldContainCover(coverPath) {
  // We'd need sharp or similar for this; for now, assume standard unless kids
  // The caller can override
  return null;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load existing catalogue
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const books = catalog.books;
  const existingSlugs = new Set(books.map((b) => b.slug));
  const existingAsins = new Set(books.flatMap((b) => b.asins || []));

  // Check if this ASIN is already in the catalogue
  if (existingAsins.has(ASIN)) {
    console.error(`ASIN ${ASIN} is already in the catalogue.`);
    const match = books.find((b) => (b.asins || []).includes(ASIN));
    if (match) console.error(`  → "${match.title}" (${match.slug})`);
    process.exit(1);
  }

  // 2. Fetch and parse the Amazon page
  const html = await fetchAmazonPage(ASIN);
  const fullTitle = extractTitle(html);
  if (!fullTitle) {
    console.error("Could not extract title from Amazon page. The page may have changed format.");
    process.exit(1);
  }

  const { title, subtitle: autoSubtitle } = splitTitle(fullTitle);
  const subtitle = SUBTITLE || autoSubtitle;
  const author = extractAuthor(html) || "Dr. Zahir Hasan";
  const description = extractDescription(html);
  const coverUrl = extractCoverUrl(html);
  const pubDate = extractPubDate(html);
  const isbn13 = extractIsbn13(html);
  const companionCandidates = extractCompanionAsins(html, ASIN);

  console.log(`\n──── Extracted from Amazon ────`);
  console.log(`Title:    ${title}`);
  console.log(`Subtitle: ${subtitle || "(none)"}`);
  console.log(`Author:   ${author}`);
  console.log(`Desc:     ${description ? description.length + " paragraphs" : "NOT FOUND"}`);
  console.log(`Cover:    ${coverUrl ? "found" : "NOT FOUND"}`);
  console.log(`PubDate:  ${pubDate || "?"}`);
  console.log(`ISBN-13:  ${isbn13 || "?"}`);
  console.log(`Companion ASINs: ${companionCandidates.slice(0, 6).join(", ") || "none found"}`);

  // Try to find the companion ASIN (the other format)
  // We'll check if any companion candidate is also a book by the same author
  let asins = [ASIN];
  if (companionCandidates.length > 0) {
    // Try the first few candidates to find the matching format
    for (const candidate of companionCandidates.slice(0, 5)) {
      try {
        const cHtml = await fetchAmazonPage(candidate);
        const cTitle = extractTitle(cHtml);
        if (cTitle && cTitle.includes(title.split(" ").slice(0, 3).join(" "))) {
          asins.push(candidate);
          console.log(`Found companion: ${candidate} → "${cTitle}"`);
          // Also check for ISBN on the paperback page
          if (!isbn13) {
            const cIsbn = extractIsbn13(cHtml);
            if (cIsbn) console.log(`ISBN-13 from companion: ${cIsbn}`);
          }
          break;
        }
      } catch {
        // Skip unreachable candidates
      }
    }
  }

  // 3. Generate the slug
  const slug = uniqueSlug(slugify(title), existingSlugs);

  // 4. Download cover
  let coverPath = null;
  if (coverUrl && !DRY_RUN) {
    coverPath = await downloadCover(coverUrl, slug);
  } else if (coverUrl) {
    coverPath = `covers/${slug}.jpg`;
    console.log(`[dry-run] Would download cover to ${coverPath}`);
  }

  // 5. Build the catalogue entry
  const entry = {
    slug,
    title,
    subtitle: subtitle || null,
    author: author.startsWith("Dr.") ? author : `Dr. ${author}`,
    list: LIST,
    status: "published",
    asins: asins.length > 1 ? asins : asins,
    description: description || ["(Description not available — edit catalog.json to add it.)"],
    cover: coverPath || `covers/${slug}.jpg`,
    coverFit: LIST === "kids" ? "contain" : null,
    series: SERIES_NAME || null,
    isbn: {
      paperback: isbn13 || null,
      hardcover: null,
    },
    press: {
      href: `/book/${slug}`,
      pill: LIST_PILLS[LIST],
      featured: FEATURED,
      featuredOrder: FEATURED ? books.filter((b) => b.press?.featured).length + 1 : null,
    },
    authorSite: {
      show: true,
      section: LIST,
      blurb: subtitle
        ? `${subtitle}. ${(description || [""])[0].slice(0, 180)}...`
        : (description || [""])[0].slice(0, 250) + "...",
      featured: false,
      amazonJp: false,
    },
  };

  console.log(`\n──── Generated catalogue entry ────`);
  console.log(JSON.stringify(entry, null, 2));

  if (DRY_RUN) {
    console.log("\n[dry-run] No changes written.");
    return;
  }

  // 6. Add to catalogue and save
  books.push(entry);
  // Sort books: by list (policy, practice, fiction, kids), then alphabetically
  const listOrder = { policy: 0, practice: 1, fiction: 2, kids: 3 };
  books.sort((a, b) => {
    const la = listOrder[a.list] ?? 99;
    const lb = listOrder[b.list] ?? 99;
    if (la !== lb) return la - lb;
    return a.title.localeCompare(b.title);
  });

  catalog._updated = new Date().toISOString().slice(0, 10);
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 1) + "\n");

  console.log(`\n✓ Added "${title}" to catalog.json`);
  console.log(`  Slug: ${slug}`);
  console.log(`  ASINs: ${asins.join(", ")}`);
  console.log(`  Cover: ${coverPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the entry in catalog/catalog.json`);
  console.log(`  2. git add catalog/ && git commit -m "Add ${title}"`);
  console.log(`  3. git push  →  both sites update automatically`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
