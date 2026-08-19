import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { subscribeNewsletter } from "../../lib/api/site.functions";
import { PressAssistant } from "./Assistant";

const ORG_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Maple & Pine Press",
  url: "https://mapleandpinepress.com",
  logo: "https://mapleandpinepress.com/assets/favicon.png",
  description:
    "Independent press in Tokyo publishing serious nonfiction and illustrated children's books.",
  founder: { "@type": "Person", name: "Zahir Hasan" },
});

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <div className="topbar">
        <b>New release:</b> <i>A Manufactured War</i>, updated through August 2026, in ebook
        and paperback
      </div>
      <header className="site-header">
        <div className="hwrap">
          <Link to="/" className="wordmark" aria-label="Maple & Pine Press home">
            <span className="wm1">MAPLE&nbsp;&amp;&nbsp;PINE&nbsp;PRESS</span>
            <span className="wm2">Independent&nbsp;Press&nbsp;·&nbsp;Tokyo</span>
          </Link>
          <nav aria-label="Main">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "active" }}>
              Home
            </Link>
            <Link to="/books" activeProps={{ className: "active" }}>
              Books
            </Link>
            <Link to="/about" activeProps={{ className: "active" }}>
              About
            </Link>
            <Link to="/toolkit" activeProps={{ className: "active" }}>
              Toolkit
            </Link>
            <Link to="/beyond-the-press" activeProps={{ className: "active" }}>
              Beyond
            </Link>
            <Link to="/submissions" activeProps={{ className: "active" }}>
              Submissions
            </Link>
            <Link to="/books" className="cta">
              Browse Catalog
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <PressAssistant />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORG_JSONLD }} />
      <footer className="site-footer">
        <div className="wrap">
          <div className="fgrid">
            <div>
              <div className="fmark">MAPLE & PINE PRESS</div>
              <p style={{ maxWidth: 280 }}>
                An independent press in Tokyo, publishing serious nonfiction and illustrated
                children's books for readers worldwide.
              </p>
            </div>
            <div>
              <h5>Books</h5>
              <Link to="/books">Full Catalog</Link>
              <Link to="/a-manufactured-war">A Manufactured War</Link>
              <Link to="/the-arab-dilemma">The Arab Dilemma</Link>
              <Link to="/books">Children's List</Link>
            </div>
            <div>
              <h5>Press</h5>
              <Link to="/about">About Us</Link>
              <Link to="/submissions">Submissions</Link>
              <Link to="/toolkit">Author Toolkit</Link>
              <Link to="/beyond-the-press">Beyond the Press</Link>
              <Link to="/">Newsletter</Link>
            </div>
            <div>
              <h5>Contact</h5>
              <a href="mailto:zachthasan@gmail.com">Email the Press</a>
              <p>Tokyo, Japan</p>
            </div>
          </div>
          <div className="fbottom">
            <div>© 2026 Maple & Pine Press. All rights reserved.</div>
            <div>Independent Press · Tokyo</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubscribe() {
    const value = email.trim();
    if (!value || !value.includes("@")) {
      setState("err");
      return;
    }
    setState("busy");
    try {
      await subscribeNewsletter({ data: { email: value } });
      setState("ok");
    } catch {
      setState("err");
    }
  }

  return (
    <div className="newsl">
      <div className="wrap">
        <h2>Hear About New Releases First</h2>
        <p>One short email when a new book is published. No noise, no spam. Just the books.</p>
        <div className="nlform">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSubscribe();
            }}
            placeholder="Your email address"
            aria-label="Email address"
          />
          <button className="nlbtn" onClick={() => void onSubscribe()} disabled={state === "busy"}>
            {state === "busy" ? "Adding you..." : "Subscribe"}
          </button>
        </div>
        {state === "ok" && <div className="nlok">Thank you. You are on the list.</div>}
        {state === "err" && (
          <div className="nlerr">Please check the email address and try again.</div>
        )}
        <div className="nlnote">We never share your address. Unsubscribe anytime.</div>
      </div>
    </div>
  );
}
