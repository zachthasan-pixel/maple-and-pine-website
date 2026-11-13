import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteLayout } from "../components/site/Layout";

/* Today's Paper: the press's daily newspaper, Maple & Pine Press.
   Everything here is read at runtime from /paper/editions.json (written by
   scripts/publish-paper.py), so a new edition needs no code change. */

type Edition = {
  date: string; // YYYY-MM-DD
  file: string; // /paper/editions/YYYY-MM-DD.pdf
  title?: string;
  lead?: string;
  front?: string; // page-one JPEG for small screens
  size?: number;
};

export const Route = createFileRoute("/paper")({
  head: () => ({
    meta: [
      { title: "Today's Paper · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Maple & Pine Press, the press's daily newspaper from Tokyo: world news, politics, technology and business, published every morning as a printable PDF.",
      },
    ],
  }),
  component: Paper,
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Parse the date as a calendar day (no timezone shift).
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[day]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
}

function sizeLabel(bytes?: number): string {
  if (!bytes) return "";
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

function isEdition(e: unknown): e is Edition {
  if (!e || typeof e !== "object") return false;
  const o = e as Record<string, unknown>;
  return typeof o.date === "string" && typeof o.file === "string";
}

function Paper() {
  const [editions, setEditions] = useState<Edition[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let live = true;
    fetch(`/paper/editions.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!live) return;
        const list = (Array.isArray(data) ? data : []).filter(isEdition);
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
        setEditions(list);
        const fromUrl = new URLSearchParams(window.location.search).get("date");
        setSelected(list.some((e) => e.date === fromUrl) ? fromUrl : (list[0]?.date ?? null));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const latest = editions?.[0];
  const current = editions?.find((e) => e.date === selected) ?? latest;
  const isLatest = !!current && current.date === latest?.date;
  // Version the URL by date so a browser never shows yesterday's cached file.
  const pdfUrl = current ? `${current.file}?v=${current.date}` : "";

  function choose(date: string) {
    setSelected(date);
    const url = new URL(window.location.href);
    if (date === latest?.date) url.searchParams.delete("date");
    else url.searchParams.set("date", date);
    window.history.replaceState(window.history.state, "", url);
    document.getElementById("paper-reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SiteLayout>
      <div className="pagehead paperhead">
        <div className="wrap">
          <div className="kicker">The Daily Edition · Tokyo</div>
          <h1>Today's Paper</h1>
          <p>
            <i>Maple &amp; Pine Press</i>, our morning newspaper: the day's world news, politics,
            technology and business on four printable pages, set fresh before 6 a.m. Tokyo time.
          </p>
        </div>
      </div>

      <div className="wrap paperwrap">
        {failed && (
          <div className="paper-empty">
            Today's paper couldn't be loaded just now. Please try again in a moment, or{" "}
            <a href="/paper/latest.pdf">open the latest edition as a PDF</a>.
          </div>
        )}
        {!failed && editions === null && <div className="paper-empty">Fetching the paper…</div>}
        {!failed && editions !== null && !current && (
          <div className="paper-empty">
            The first edition is on the press. Check back tomorrow morning.
          </div>
        )}

        {current && (
          <section className="paper-reader" id="paper-reader" aria-label="Edition reader">
            <div className="paper-bar">
              <div>
                <div className="paper-edtag">
                  {isLatest ? "Latest edition" : "From the archive"}
                </div>
                <h2 className="paper-date">{longDate(current.date)}</h2>
                {current.lead && <p className="paper-lead">{current.lead}</p>}
              </div>
              <div className="paper-actions">
                <a
                  className="paper-dl"
                  href={pdfUrl}
                  download={`Maple-and-Pine-Press-${current.date}.pdf`}
                >
                  Download PDF
                </a>
                <a className="paper-open" href={pdfUrl} target="_blank" rel="noopener">
                  Open full screen
                </a>
                {!isLatest && (
                  <button type="button" className="paper-back" onClick={() => choose(latest!.date)}>
                    Back to today
                  </button>
                )}
              </div>
            </div>

            {narrow ? (
              <a className="paper-front" href={pdfUrl} target="_blank" rel="noopener">
                {current.front ? (
                  <img src={current.front} alt={`Front page, ${longDate(current.date)}`} />
                ) : (
                  <span className="paper-front-ph">{current.title ?? "Maple & Pine Press"}</span>
                )}
                <span className="paper-front-cta">Tap to read all four pages</span>
              </a>
            ) : (
              <div className="paper-frame">
                <object
                  key={current.date}
                  data={`${pdfUrl}#view=FitH&navpanes=0`}
                  type="application/pdf"
                  aria-label={`Maple & Pine Press, ${longDate(current.date)}`}
                >
                  <div className="paper-fallback">
                    {current.front && <img src={current.front} alt="" />}
                    <p>Your browser can't show the paper here.</p>
                    <a className="paper-dl" href={pdfUrl}>
                      Open the PDF
                    </a>
                  </div>
                </object>
              </div>
            )}
          </section>
        )}

        {editions && editions.length > 0 && (
          <section className="paper-archive" aria-labelledby="paper-archive-h">
            <h2 id="paper-archive-h">Past Editions</h2>
            <p className="paper-archnote">The last thirty mornings, newest first.</p>
            <ol>
              {editions.map((e) => (
                <li key={e.date} className={e.date === current?.date ? "on" : undefined}>
                  <button type="button" className="paper-arow" onClick={() => choose(e.date)}>
                    <span className="paper-adate">{shortDate(e.date)}</span>
                    <span className="paper-alead">{e.lead ?? longDate(e.date)}</span>
                  </button>
                  <a
                    className="paper-apdf"
                    href={`${e.file}?v=${e.date}`}
                    download={`Maple-and-Pine-Press-${e.date}.pdf`}
                    aria-label={`Download the ${longDate(e.date)} edition`}
                  >
                    PDF{e.size ? ` · ${sizeLabel(e.size)}` : ""}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
