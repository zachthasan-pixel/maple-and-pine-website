import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";
import {
  CATALOG,
  CATEGORY_LABELS,
  amazonUrl,
  bookBySlug,
  fullTitle,
  neighbours,
  type CatalogEntry,
} from "../components/site/catalog";
import {
  AUTHOR_SITE,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  metaDescription,
  pageHead,
  pageTitle,
} from "../components/site/seo";

// The title shown in a search result. Two books that share a title (the two
// volumes of The Lattice) are told apart by their subtitles.
function searchTitle(book: CatalogEntry): string {
  const shared = CATALOG.some((b) => b.slug !== book.slug && b.title === book.title);
  return pageTitle(shared ? fullTitle(book) : book.title);
}

// What the page is about, in the book's own words; the bare facts when it has none.
function searchDescription(book: CatalogEntry): string {
  return book.description?.length
    ? metaDescription(book.description)
    : `${fullTitle(book)} — by Zahir Hasan, published by ${SITE_NAME}.`;
}

// The book described for search engines (schema.org), so a result can show it as a book.
function bookData(book: CatalogEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: fullTitle(book),
    author: { "@type": "Person", name: "Zahir Hasan", url: AUTHOR_SITE },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN },
    inLanguage: "en",
    url: absoluteUrl(book.href),
    description: searchDescription(book),
    ...(book.coverImg ? { image: absoluteUrl(book.coverImg) } : {}),
    // Amazon editions, ebook first where both exist.
    workExample: book.asins.map((asin, i) => ({
      "@type": "Book",
      bookFormat: i === 0 ? "https://schema.org/EBook" : "https://schema.org/Paperback",
      url: amazonUrl(asin),
    })),
  };
}

export const Route = createFileRoute("/book/$slug")({
  loader: ({ params }) => {
    const book = bookBySlug(params.slug);
    if (!book) throw notFound();
    // Two titles have a page of their own design; this address sends readers there,
    // so each book has exactly one address.
    if (book.href !== `/book/${book.slug}`) throw redirect({ href: book.href, statusCode: 301 });
    return book;
  },
  head: ({ loaderData }) => {
    const b = loaderData;
    if (!b) return {};
    return pageHead({
      title: searchTitle(b),
      description: searchDescription(b),
      path: b.href,
      image: b.coverImg,
      type: "book",
    });
  },
  component: BookPage,
});

function BookPage() {
  const book = Route.useLoaderData();

  // Other titles from the same list, for onward reading.
  const alsoIn = neighbours(book);

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <span className={`pill ${book.pillClass}`}>{book.pill}</span>
          <h1>{book.title}</h1>
          {book.subtitle ? <p className="booksub">{book.subtitle}</p> : null}
        </div>
      </div>

      <div className="wrap bookpage">
        <div className="bookgrid">
          <div className="bookcover">
            {book.coverImg ? (
              <img
                className={book.coverFit ? "contain" : undefined}
                src={book.coverImg}
                alt={`${book.title} cover`}
              />
            ) : (
              <div className={`cover mock ${book.pillClass}`}>
                <div className="mtag">{CATEGORY_LABELS[book.pillClass]}</div>
                <div className="mtit">{book.title}</div>
                <div className="mauth">Zahir Hasan</div>
              </div>
            )}
          </div>

          <div className="bookmeta">
            {book.description && book.description.length > 0 ? (
              <div className="bookdesc">
                {book.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}

            <dl>
              <dt>Author</dt>
              <dd>Zahir Hasan</dd>
              <dt>List</dt>
              <dd>{CATEGORY_LABELS[book.pillClass]}</dd>
              <dt>Status</dt>
              <dd>
                {book.status === "published" ? "Published" : "Forthcoming"}
              </dd>
              <dt>Publisher</dt>
              <dd>Maple &amp; Pine Press</dd>
            </dl>

            {book.asins.length > 0 ? (
              <div className="buyrow">
                {book.asins.map((asin, i) => (
                  <a
                    key={asin}
                    className="buylink"
                    href={amazonUrl(asin)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {book.asins.length > 1 && i === 1
                      ? "Buy the print edition"
                      : "Buy on Amazon"}
                  </a>
                ))}
              </div>
            ) : (
              <p className="soonnote">
                This title is with the printer. It will be available shortly.
              </p>
            )}

            <p className="backlink">
              <Link to="/books">← Back to the catalog</Link>
            </p>
          </div>
        </div>

        {alsoIn.length > 0 ? (
          <section className="alsoin">
            <h2>More from the {CATEGORY_LABELS[book.pillClass]} list</h2>
            <ul>
              {alsoIn.map((b) => (
                <li key={b.slug}>
                  <Link to={b.href}>{b.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookData(book)) }}
      />
    </SiteLayout>
  );
}
