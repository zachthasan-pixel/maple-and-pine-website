import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";
import {
  CATALOG,
  CATEGORY_LABELS,
  amazonUrl,
  bookBySlug,
} from "../components/site/catalog";

export const Route = createFileRoute("/book/$slug")({
  loader: ({ params }) => {
    const book = bookBySlug(params.slug);
    if (!book) throw notFound();
    return book;
  },
  head: ({ loaderData }) => {
    const b = loaderData;
    if (!b) return {};
    const full = b.subtitle ? `${b.title}: ${b.subtitle}` : b.title;
    return {
      meta: [
        { title: `${b.title} · Maple & Pine Press` },
        {
          name: "description",
          content: `${full} — by Zahir Hasan, published by Maple & Pine Press.`,
        },
      ],
    };
  },
  component: BookPage,
});

function BookPage() {
  const book = Route.useLoaderData();

  // Other titles from the same list, for onward reading.
  const alsoIn = CATALOG.filter(
    (b) => b.filter === book.filter && b.slug !== book.slug,
  ).slice(0, 4);

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
    </SiteLayout>
  );
}
