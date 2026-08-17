import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/a-manufactured-war")({
  head: () => ({
    meta: [
      { title: "A Manufactured War · Maple & Pine Press" },
      {
        name: "description",
        content:
          "The Israeli and American Assault on Iran. By Zahir Hasan. Updated through August 2026. The first title from Maple & Pine Press, Tokyo.",
      },
    ],
  }),
  component: ManufacturedWar,
});

const AMAZON_COM = "https://www.amazon.com/dp/B0H9J8XMFW";
const AMAZON_JP = "https://www.amazon.co.jp/dp/B0H9J8XMFW";

const BOOK_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Book",
  name: "A Manufactured War: The Israeli and American Assault on Iran",
  author: { "@type": "Person", name: "Zahir Hasan" },
  publisher: { "@type": "Organization", name: "Maple & Pine Press" },
  inLanguage: "en",
  datePublished: "2026-08",
  numberOfPages: 132,
  bookFormat: "https://schema.org/Paperback",
  url: "https://mapleandpinepress.com/a-manufactured-war",
  image: "https://mapleandpinepress.com/assets/manufactured-war-cover.jpg",
});

function ManufacturedWar() {
  return (
    <SiteLayout>
      <div className="wrap">
        <div className="crumbs">
          <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/books">Books</Link> &nbsp;/&nbsp; A
          Manufactured War
        </div>
        <div className="detail">
          <div className="dcover">
            <img src="/assets/manufactured-war-cover.jpg" alt="A Manufactured War book cover" />
            <div className="dmeta">
              <div>
                <b>Publisher</b>
                <span>Maple &amp; Pine Press, Tokyo</span>
              </div>
              <div>
                <b>Edition</b>
                <span>Updated through August 2026</span>
              </div>
              <div>
                <b>Formats</b>
                <span>Ebook · Paperback (6″×9″)</span>
              </div>
              <div>
                <b>Pages</b>
                <span>132 (paperback)</span>
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
            <h1>A Manufactured War</h1>
            <div className="dsub">The Israeli and American Assault on Iran</div>
            <div className="dauth">Zahir Hasan, MPPA, LLM, EdD</div>
            <div className="buyrow">
              <a className="buy" href={AMAZON_COM} target="_blank" rel="noreferrer">
                Buy on Amazon
              </a>
              <a className="buy" href={AMAZON_JP} target="_blank" rel="noreferrer">
                Amazon Japan
              </a>
            </div>
            <p className="buynote">Available now in ebook and paperback.</p>
            <h4>About the Book</h4>
            <p>
              <b>
                On 28 February 2026, American and Israeli aircraft struck Iran. Within hours the
                Supreme Leader was dead, the Strait of Hormuz was closing, and the world was
                pricing in the largest oil shock in history. Governments called it necessity.
                This book calls it a choice.
              </b>
            </p>
            <p>
              <i>A Manufactured War</i> traces how three decades of warnings, the deliberate
              dismantling of the nuclear deal, and the domestic troubles of two embattled
              leaders converged to produce a war that experts had long predicted, and that
              diplomacy had nearly prevented just days before the first strikes.
            </p>
            <blockquote className="pull">
              Updated through August 2026: six new chapters and more than thirteen thousand
              words, following the war into its summer of attrition.
            </blockquote>
            <p>
              The new chapters follow the collapse of the Islamabad talks and the naval blockade
              that came after; the fourteen-point memorandum signed at Versailles and the
              ambiguities that unravelled it within a fortnight; the contested succession inside
              Iran; the economic damage, now measured rather than forecast, from Dhaka to
              Berlin; the unanswered constitutional question of who may take a country to war;
              and the summer of attrition in which a conflict neither government calls a war has
              quietly become permanent. A dated chronology runs from the 2015 nuclear deal to
              the present.
            </p>
            <p>
              Drawing on parliamentary briefings, government documents, and research from across
              the region, fully referenced throughout, this is a clear, unflinching account for
              students of policy, for investors, and for every reader who wants to understand
              how this war was made.
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
