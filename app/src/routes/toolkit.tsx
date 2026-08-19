import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { SiteLayout } from "../components/site/Layout";
import {
  checkSubmissionStatus,
  checkTitle,
  generateCoverArt,
} from "../lib/api/site.functions";

export const Route = createFileRoute("/toolkit")({
  head: () => ({
    meta: [
      { title: "Author Toolkit · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Free tools for authors from Maple & Pine Press: title and name checker, AI cover concept studio, royalty and print calculator, and submission status.",
      },
    ],
  }),
  component: Toolkit,
});

type Match = { title: string; author: string; year: string; source: string };

function TitleChecker() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [err, setErr] = useState(false);

  async function run() {
    const query = q.trim();
    if (query.length < 2 || busy) return;
    setBusy(true);
    setErr(false);
    setDone(false);
    try {
      const res = await checkTitle({ data: { q: query } });
      setMatches(res.matches);
      setDone(true);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sform">
      <label htmlFor="tk-title">Book title or press name to check</label>
      <input
        id="tk-title"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void run();
        }}
        placeholder="e.g. The Winter Ledger"
      />
      <button className="sbtn" onClick={() => void run()} disabled={busy}>
        {busy ? "Searching the world's book databases..." : "Check This Name"}
      </button>
      {err && <div className="formerr">The search could not run. Please try again.</div>}
      {done && matches.length === 0 && (
        <div className="formok">
          No published book with this title surfaced in Google Books or Open Library. A clear
          field, as far as the big catalogs can see.
        </div>
      )}
      {done && matches.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="fieldnote" style={{ marginBottom: 8 }}>
            {matches.length} existing book{matches.length > 1 ? "s" : ""} with the same or a
            similar title:
          </div>
          {matches.map((m, i) => (
            <div key={i} className="tkmatch">
              <b>{m.title}</b>
              <span>
                {m.author}
                {m.year ? ` · ${m.year}` : ""} · {m.source}
              </span>
            </div>
          ))}
        </div>
      )}
      {done && (
        <div className="fieldnote" style={{ marginTop: 14 }}>
          Book titles themselves are generally not copyrightable, but identical titles in the
          same genre cause confusion, and names used as brands or series can be trademarked.
          For a proper trademark check, search the official registries:{" "}
          <a href="https://tmsearch.uspto.gov/search/search-information" target="_blank" rel="noreferrer">
            United States
          </a>
          ,{" "}
          <a
            href="https://www.ic.gc.ca/app/opic-cipo/trdmrks/srch/home"
            target="_blank"
            rel="noreferrer"
          >
            Canada
          </a>
          ,{" "}
          <a href="https://www.j-platpat.inpit.go.jp/" target="_blank" rel="noreferrer">
            Japan
          </a>
          . This tool is a research aid, not legal advice.
        </div>
      )}
    </div>
  );
}

function CoverStudio() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [mood, setMood] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  async function run() {
    if (!title.trim() || !author.trim() || !mood.trim() || busy) {
      if (!busy) setMessage("Please fill in the title, author name, and mood first.");
      return;
    }
    setBusy(true);
    setMessage("");
    setCoverUrl("");
    try {
      const res = await generateCoverArt({ data: { mood: mood.trim() } });
      if (!res.ok) {
        setMessage(
          res.reason === "cap"
            ? "Today's free cover allowance is used up. Please come back tomorrow."
            : "The art studio is unavailable right now. Please try again shortly.",
        );
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const W = 1600;
        const H = 2560;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Cover-fit the art.
        const scale = Math.max(W / img.width, H / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        // Legibility bands.
        const top = ctx.createLinearGradient(0, 0, 0, H * 0.42);
        top.addColorStop(0, "rgba(10,10,12,0.82)");
        top.addColorStop(1, "rgba(10,10,12,0)");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, W, H * 0.42);
        const bottom = ctx.createLinearGradient(0, H * 0.7, 0, H);
        bottom.addColorStop(0, "rgba(10,10,12,0)");
        bottom.addColorStop(1, "rgba(10,10,12,0.85)");
        ctx.fillStyle = bottom;
        ctx.fillRect(0, H * 0.7, W, H * 0.3);
        // Title.
        ctx.fillStyle = "#f5f1e6";
        ctx.textAlign = "center";
        ctx.font = "bold 150px Georgia, 'Times New Roman', serif";
        const lines = wrapText(ctx, title.trim().toUpperCase(), W - 260);
        let y = 320;
        for (const line of lines.slice(0, 4)) {
          ctx.fillText(line, W / 2, y);
          y += 170;
        }
        // Rule.
        ctx.fillStyle = "#a8342a";
        ctx.fillRect(W / 2 - 170, y - 60, 340, 10);
        // Author.
        ctx.fillStyle = "#efe9db";
        ctx.font = "bold 92px Georgia, 'Times New Roman', serif";
        ctx.fillText(author.trim(), W / 2, H - 220);
        setCoverUrl(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = "data:image/png;base64," + res.image;
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sform">
      <label htmlFor="tk-ctitle">Book title</label>
      <input
        id="tk-ctitle"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Your title, as it should appear"
      />
      <label htmlFor="tk-cauthor">Author name</label>
      <input
        id="tk-cauthor"
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Name on the cover"
      />
      <label htmlFor="tk-cmood">Mood and imagery</label>
      <input
        id="tk-cmood"
        type="text"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="e.g. stormy sea at dusk, lone lighthouse, literary thriller"
      />
      <button className="sbtn" onClick={() => void run()} disabled={busy}>
        {busy ? "Painting your draft cover..." : "Generate a Draft Cover"}
      </button>
      {message && <div className="formerr">{message}</div>}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {coverUrl && (
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <img
            src={coverUrl}
            alt="Generated draft cover"
            style={{ maxWidth: "100%", borderRadius: 4, boxShadow: "0 14px 30px rgba(28,24,18,.25)" }}
          />
          <div style={{ marginTop: 12 }}>
            <a className="buy" href={coverUrl} download="draft-cover-1600x2560.jpg">
              Download (1600 × 2560)
            </a>
          </div>
        </div>
      )}
      <div className="fieldnote" style={{ marginTop: 14 }}>
        These are concept drafts to explore direction, generated with AI. If you use
        AI-generated art on a published cover, remember to declare it during store setup, the
        same way our submission form asks. A print-ready cover with spine and back still needs
        proper production.
      </div>
    </div>
  );
}

function RoyaltyCalculator() {
  const [words, setWords] = useState("50000");
  const [price, setPrice] = useState("9.99");
  const [out, setOut] = useState<string[]>([]);

  function calc() {
    const w = parseInt(words.replace(/[^0-9]/g, ""), 10);
    const p = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (!w || !p || w < 1000 || p <= 0) {
      setOut(["Please enter a word count (at least 1,000) and a price in US dollars."]);
      return;
    }
    const pages = Math.max(24, Math.ceil(w / 280) + 8);
    const spine = pages * 0.002252;
    const printing = pages <= 108 ? 2.15 : 0.85 + 0.012 * pages;
    const printRoyalty = 0.6 * p - printing;
    const ebook70 = p >= 2.99 && p <= 9.99;
    const ebookRoyalty = ebook70 ? 0.7 * (p - 0.06) : 0.35 * p;
    setOut([
      `Estimated paperback length: about ${pages} pages (6 × 9 inch).`,
      `Spine width: about ${spine.toFixed(3)} inches (${(spine * 25.4).toFixed(1)} mm).`,
      `Estimated Amazon printing cost: $${printing.toFixed(2)} per copy.`,
      `Paperback royalty at $${p.toFixed(2)}: about $${Math.max(0, printRoyalty).toFixed(2)} per copy${printRoyalty <= 0 ? " (price is below printing cost; raise it)" : ""}.`,
      `Ebook royalty at $${p.toFixed(2)}: about $${ebookRoyalty.toFixed(2)} per copy (${ebook70 ? "70%" : "35% tier; the 70% tier needs a price between $2.99 and $9.99"}).`,
    ]);
  }

  return (
    <div className="sform">
      <label htmlFor="tk-words">Manuscript word count</label>
      <input
        id="tk-words"
        type="text"
        value={words}
        onChange={(e) => setWords(e.target.value)}
        placeholder="e.g. 50000"
      />
      <label htmlFor="tk-price">Planned price (US dollars)</label>
      <input
        id="tk-price"
        type="text"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="e.g. 9.99"
      />
      <button className="sbtn" onClick={calc}>
        Calculate
      </button>
      {out.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {out.map((line, i) => (
            <div key={i} className="tkmatch">
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
      <div className="fieldnote" style={{ marginTop: 14 }}>
        Estimates use Amazon's published United States rates for black-and-white paperbacks and
        standard ebook tiers. Always confirm exact figures on the store's own pricing screen
        before publishing.
      </div>
    </div>
  );
}

function StatusChecker() {
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function run() {
    if (!ref.trim() || !email.trim() || busy) return;
    setBusy(true);
    setResult("");
    try {
      const res = await checkSubmissionStatus({
        data: { ref: ref.trim(), email: email.trim() },
      });
      if (!res.found) {
        setResult(
          "No submission matches that reference number and email. Check both and try again.",
        );
      } else {
        const label =
          res.status === "received"
            ? "Received and awaiting review"
            : res.status === "in review"
              ? "In review"
              : res.status;
        setResult(`"${res.title}" — status: ${label}. Submitted ${res.submitted.slice(0, 10)}.`);
      }
    } catch {
      setResult("The lookup could not run. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sform">
      <label htmlFor="tk-ref">Reference number</label>
      <input
        id="tk-ref"
        type="text"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="MP-XXXXXX"
      />
      <label htmlFor="tk-email">Email used on the submission</label>
      <input
        id="tk-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button className="sbtn" onClick={() => void run()} disabled={busy}>
        {busy ? "Checking..." : "Check Status"}
      </button>
      {result && <div className="fieldnote" style={{ marginTop: 14 }}>{result}</div>}
    </div>
  );
}

function Toolkit() {
  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Author Toolkit</h1>
          <p>
            Free working tools for writers, from a press that remembers what it is like to
            publish your first book. No account needed.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="tkgrid">
          <section className="tksec">
            <h2>Title &amp; Name Checker</h2>
            <p>
              Before you fall in love with a title or a pen name, see who is already using it.
              We search the world's public book catalogs and point you to the official
              trademark registries.
            </p>
            <TitleChecker />
          </section>
          <section className="tksec">
            <h2>Cover Concept Studio</h2>
            <p>
              Describe the mood of your book and get a draft cover in Amazon's exact ebook
              dimensions, with your title and name typeset. Use it to explore direction before
              committing to final artwork.
            </p>
            <CoverStudio />
          </section>
          <section className="tksec">
            <h2>Royalty &amp; Print Calculator</h2>
            <p>
              From a word count and a price: your estimated page count, spine width, printing
              cost, and what you would earn per copy sold.
            </p>
            <RoyaltyCalculator />
          </section>
          <section className="tksec">
            <h2>Submission Status</h2>
            <p>
              Submitted a manuscript to us? Enter the reference number from your confirmation
              and the email you used.
            </p>
            <StatusChecker />
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
