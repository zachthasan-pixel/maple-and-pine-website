import { Link, createFileRoute } from "@tanstack/react-router";

import { NewsletterBand, SiteLayout } from "../components/site/Layout";
import { CATALOG, CatalogCard } from "../components/site/catalog";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <div className="hero">
        <div className="wrap">
          <div>
            <div className="kicker">New from Hasan Publishing</div>
            <h1>The Arab Dilemma</h1>
            <div className="sub">
              Gaza, Atrocity, and the Politics of Abandonment After October 7
            </div>
            <p className="blurb">
              Why did the world watch Gaza's destruction unfold, and look away? Drawing on
              international law and diplomatic history, Dr. Zahir Hasan traces the political
              calculations behind a collective abandonment, and holds every side to a single
              standard.
            </p>
            <div className="btnrow">
              <Link to="/the-arab-dilemma" className="hp-btn primary">
                About the Book
              </Link>
              <Link to="/books" className="hp-btn ghost">
                View All Titles
              </Link>
            </div>
          </div>
          <div className="hero-cover">
            <div className="badge">New Release</div>
            <img src="/assets/arab-dilemma-cover.jpg" alt="The Arab Dilemma book cover" />
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
            {CATALOG.map((book) => (
              <CatalogCard key={book.id} book={book} />
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
            <span className="num">Open</span>
            <h3>To New Voices</h3>
            <p>
              We read unsolicited submissions. If you have a manuscript that deserves careful
              publishing, we want to see it.
            </p>
          </div>
        </div>
      </div>

      <NewsletterBand />
    </SiteLayout>
  );
}
