import { Link, createFileRoute } from "@tanstack/react-router";

import { NewsletterBand, SiteLayout } from "../components/site/Layout";
import { FEATURED, CatalogCard } from "../components/site/catalog";
import { pageHead } from "../components/site/seo";
import appMeta from "../app-meta.json";

export const Route = createFileRoute("/")({
  // Title and description stay in app-meta.json, where the site settings write them.
  head: () =>
    pageHead({
      title: appMeta.og_title,
      description: appMeta.og_description,
      path: "/",
    }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <div className="hero">
        <div className="wrap">
          <div>
            {/* The page's main heading names the press; the featured book is the heading under it. */}
            <h1 className="kicker hero-h1">New from Maple & Pine Press</h1>
            <h2 className="hero-title">A Manufactured War</h2>
            <div className="sub">The Israeli and American Assault on Iran</div>
            <p className="blurb">
              On 28 February 2026, American and Israeli aircraft struck Iran. Governments
              called it necessity. This book calls it a choice. Updated through August 2026
              with six new chapters, from the Versailles memorandum to the summer of
              attrition.
            </p>
            <div className="btnrow">
              <Link to="/a-manufactured-war" className="hp-btn primary">
                About the Book
              </Link>
              <Link to="/books" className="hp-btn ghost">
                View All Titles
              </Link>
            </div>
          </div>
          <div className="hero-cover">
            <div className="badge">Updated Aug 2026</div>
            <img src="/assets/manufactured-war-cover.jpg" alt="A Manufactured War book cover" />
          </div>
        </div>
      </div>

      <section className="band">
        <div className="wrap">
          <div className="sechead">
            <h2>From Our Catalog</h2>
            <div className="rule"></div>
            <Link to="/books">Browse all books →</Link>
          </div>
          <div className="grid">
            {FEATURED.map((book) => (
              <CatalogCard key={book.slug} book={book} />
            ))}
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <div>
            <span className="num">Tokyo</span>
            <h3>Independent &amp; International</h3>
            <p>
              A small press with a global outlook, publishing from Japan for readers everywhere,
              in ebook and print.
            </p>
          </div>
          <div>
            <span className="num">2</span>
            <h3>Lists, One Standard</h3>
            <p>
              Serious nonfiction on policy, law, and international affairs, alongside warm,
              beautifully illustrated books for children.
            </p>
          </div>
          <div>
            <span className="num">Closed</span>
            <h3>To Submissions</h3>
            <p>
              We are not reading new manuscripts at present. Our submissions page will say when that
              changes.
            </p>
          </div>
        </div>
      </div>

      <NewsletterBand />
    </SiteLayout>
  );
}
