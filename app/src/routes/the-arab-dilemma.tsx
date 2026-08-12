import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/the-arab-dilemma")({
  head: () => ({
    meta: [
      { title: "The Arab Dilemma · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Gaza, Atrocity, and the Politics of Abandonment After October 7. By Zahir Hasan. An analytical, evidence-based account from Maple & Pine Press, Tokyo.",
      },
    ],
  }),
  component: ArabDilemma,
});

const AMAZON_URL = "https://www.amazon.com/s?k=The+Arab+Dilemma+Zahir+Hasan&i=stripbooks";

const BOOK_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Book",
  name: "The Arab Dilemma: Gaza, Atrocity, and the Politics of Abandonment After October 7",
  author: { "@type": "Person", name: "Zahir Hasan" },
  publisher: { "@type": "Organization", name: "Maple & Pine Press" },
  inLanguage: "en",
  datePublished: "2026-08",
  numberOfPages: 205,
  bookFormat: "https://schema.org/Paperback",
  url: "https://mapleandpinepress.com/the-arab-dilemma",
  image: "https://mapleandpinepress.com/assets/arab-dilemma-cover.jpg",
});

function ArabDilemma() {
  return (
    <SiteLayout>
      <div className="wrap">
        <div className="crumbs">
          <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/books">Books</Link> &nbsp;/&nbsp; The
          Arab Dilemma
        </div>
        <div className="detail">
          <div className="dcover">
            <img src="/assets/arab-dilemma-cover.jpg" alt="The Arab Dilemma book cover" />
            <div className="dmeta">
              <div>
                <b>Publisher</b>
                <span>Maple & Pine Press, Tokyo</span>
              </div>
              <div>
                <b>Published</b>
                <span>August 2026</span>
              </div>
              <div>
                <b>Formats</b>
                <span>Ebook · Paperback (6″×9″)</span>
              </div>
              <div>
                <b>Pages</b>
                <span>205 (paperback)</span>
              </div>
              <div>
                <b>Language</b>
                <span>English</span>
              </div>
              <div>
                <b>Category</b>
                <span>Middle East Politics</span>
              </div>
            </div>
          </div>
          <div className="dinfo">
            <span className="pill policy">Politics &amp; Current Affairs</span>
            <h1>The Arab Dilemma</h1>
            <div className="dsub">
              Gaza, Atrocity, and the Politics of Abandonment After October 7
            </div>
            <div className="dauth">Zahir Hasan, MPPA, LLM, EdD</div>
            <div className="buyrow">
              <a className="buy" href={AMAZON_URL} target="_blank" rel="noreferrer">
                Buy on Amazon
              </a>
            </div>
            <p className="buynote">Also coming to Apple Books and Google Play Books.</p>
            <h4>About the Book</h4>
            <p>
              <b>Why did the world watch Gaza's destruction unfold, and look away?</b>
            </p>
            <p>
              On October 7, 2023, Hamas's attack on Israel set in motion a war whose scale of
              devastation in Gaza has been called, by many observers, an overkill.{" "}
              <i>The Arab Dilemma</i> asks the harder question that followed: why did Arab
              governments, bound to Palestinians by language, faith, and decades of solidarity
              rhetoric, largely stand aside? And why did the wider international community,
              despite mounting evidence of atrocity, fail to stop it?
            </p>
            <p>
              Drawing on international law, diplomatic history, and the shifting politics of the
              Middle East, Dr. Zahir Hasan traces the political calculations, historical
              grievances, and strategic interests behind this collective abandonment. Chapter by
              chapter, the book examines the actions, and inactions, of Egypt, Jordan, Saudi
              Arabia, Qatar, Iran, and the Gulf states, then widens the lens to the United
              Nations, the United States, and Europe.
            </p>
            <blockquote className="pull">
              This is not a one-sided polemic. Hasan holds human rights violations to a single
              standard, and confronts uncomfortable truths on every side of the conflict.
            </blockquote>
            <p>
              The book closes with forward-looking, actionable recommendations for regional and
              international policymakers, written as the conflict continues and peace proposals
              are repeatedly rejected. For readers of Middle East politics, international
              relations, and human rights history who want an analytical, evidence-based
              account, not another op-ed.
            </p>
            <h4>About the Author</h4>
            <p>
              Zahir Hasan holds graduate degrees in public policy, law, and education, and
              teaches at the university level in Tokyo.{" "}
              <Link to="/about" className="authlink">
                Read more →
              </Link>
            </p>
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: BOOK_JSONLD }} />
    </SiteLayout>
  );
}
