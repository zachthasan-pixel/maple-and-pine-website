import { Link } from "@tanstack/react-router";

export type BookCategory = "policy" | "practice" | "fiction" | "kids";

export type CatalogEntry = {
  slug: string;
  title: string;
  subtitle?: string;
  /** Amazon ASINs, ebook first where both exist. */
  asins: string[];
  /** Publisher description, as it appears on the book's store listing. */
  description?: string[];
  status: "published" | "forthcoming";
  pill: string;
  pillClass: BookCategory;
  filter: BookCategory;
  coverImg?: string;
  coverFit?: "contain";
  href: string;
};

export const CATEGORY_LABELS: Record<BookCategory, string> = {
  policy: "Politics & International Affairs",
  practice: "Education & Practice",
  fiction: "Fantasy & Speculative Fiction",
  kids: "Children's Books",
};

// The catalogue itself lives in ONE shared file, catalog/catalog.json at the
// repository root. drzahirhasan.com is generated from the same file, so a new
// title is added there and nowhere else.
import catalogJson from "../../../../catalog/catalog.json";

type CatalogJsonBook = {
  slug: string;
  title: string;
  subtitle: string | null;
  list: BookCategory;
  status: "published" | "forthcoming";
  asins: string[];
  description: string[];
  cover: string | null;
  coverFit: "contain" | null;
  press: { href: string; pill: string; featured: boolean; featuredOrder: number | null };
};

const BOOKS = (catalogJson as { books: CatalogJsonBook[] }).books;

export const CATALOG: CatalogEntry[] = BOOKS.map((b) => ({
  slug: b.slug,
  title: b.title,
  ...(b.subtitle ? { subtitle: b.subtitle } : {}),
  asins: b.asins,
  ...(b.description.length ? { description: b.description } : {}),
  status: b.status,
  pill: b.press.pill,
  pillClass: b.list,
  filter: b.list,
  coverImg: b.cover ? `/assets/${b.cover}` : undefined,
  coverFit: b.coverFit ?? undefined,
  href: b.press.href,
}));

export function bookBySlug(slug: string): CatalogEntry | undefined {
  return CATALOG.find((b) => b.slug === slug);
}

export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}

export function CatalogCard({ book }: { book: CatalogEntry }) {
  const inner = (
    <>
      {book.coverImg ? (
        <div className={`cover${book.coverFit ? " contain" : ""}`}>
          <img src={book.coverImg} alt={`${book.title} cover`} loading="lazy" />
        </div>
      ) : (
        <div className={`cover mock ${book.pillClass}`}>
          <div className="mtag">{CATEGORY_LABELS[book.pillClass]}</div>
          <div className="mtit">{book.title}</div>
          <div className="mauth">Zahir Hasan</div>
        </div>
      )}
      <span className={`pill ${book.pillClass}`}>{book.pill}</span>
      <h3>{book.title}</h3>
      <div className="meta">
        {book.subtitle ? <span className="sub">{book.subtitle}</span> : null}
        {book.description?.[0] ? (
          <span className="excerpt">{book.description[0]}</span>
        ) : null}
        <span>
          Zahir Hasan
          {book.status === "forthcoming" ? " · Forthcoming" : ""}
        </span>
      </div>
    </>
  );

  return (
    <Link to={book.href} className="card">
      {inner}
    </Link>
  );
}

/**
 * The home page shows one title from each list rather than all sixty —
 * a shelf, not an inventory.
 */
export const FEATURED: CatalogEntry[] = BOOKS.filter((b) => b.press.featured)
  .sort((a, b) => (a.press.featuredOrder ?? 99) - (b.press.featuredOrder ?? 99))
  .map((b) => bookBySlug(b.slug) as CatalogEntry);
