import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/toolkit/print-cover")({
  head: () => ({
    meta: [
      { title: "Print Cover Studio · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Work out the spine width and full-wrap dimensions for a paperback cover, to Amazon KDP specification. A free tool from Maple & Pine Press.",
      },
    ],
  }),
  component: PrintCoverStudio,
});

const TRIM: Record<string, [number, number]> = {
  "5 × 8": [5, 8],
  "5.25 × 8": [5.25, 8],
  "5.5 × 8.5": [5.5, 8.5],
  "6 × 9": [6, 9],
  "7 × 10": [7, 10],
  "8 × 10": [8, 10],
  "8.5 × 8.5": [8.5, 8.5],
  "8.5 × 11": [8.5, 11],
};

// Spine width factors per Amazon KDP paperback cover specification.
const FACTOR: Record<string, number> = {
  white: 0.002252,
  cream: 0.0025,
  premium_color: 0.002347,
  standard_color: 0.002252,
};
const PAPER_LABEL: Record<string, string> = {
  white: "Black & white on white",
  cream: "Black & white on cream",
  premium_color: "Premium colour",
  standard_color: "Standard colour",
};

const BLEED = 0.125;
const SAFE = 0.125;
const SPINE_TEXT_MIN_PAGES = 79;
const BARCODE_W = 2.0;
const BARCODE_H = 1.2;
const BARCODE_PAD = 0.25;

const f = (n: number, d: number) => n.toFixed(d);

function PrintCoverStudio() {
  const [title, setTitle] = useState("A Manufactured War");
  const [author, setAuthor] = useState("Zahir Hasan");
  const [trimKey, setTrimKey] = useState("6 × 9");
  const [pages, setPages] = useState(268);
  const [paper, setPaper] = useState("white");
  const [copied, setCopied] = useState(false);

  const m = useMemo(() => {
    const [tw, th] = TRIM[trimKey];
    const p = Math.min(828, Math.max(24, pages || 24));
    const spine = p * FACTOR[paper];
    return {
      tw,
      th,
      pages: p,
      spine,
      fullW: BLEED * 2 + tw * 2 + spine,
      fullH: BLEED * 2 + th,
      spineText: p >= SPINE_TEXT_MIN_PAGES,
    };
  }, [trimKey, pages, paper]);

  const px: [number, number] = [Math.round(m.fullW * 300), Math.round(m.fullH * 300)];

  const specSheet = [
    `${title} — ${author}`,
    `Trim ${trimKey} in · ${m.pages} pp · ${PAPER_LABEL[paper]}`,
    `Spine ${f(m.spine, 4)} in (${f(m.spine * 25.4, 2)} mm)`,
    `Full wrap ${f(m.fullW, 3)} × ${f(m.fullH, 3)} in`,
    `At 300 DPI ${px[0]} × ${px[1]} px`,
    `Spine text ${m.spineText ? "allowed" : "not allowed (under 79 pp)"}`,
    "Bleed 0.125 in · safe margin 0.125 in",
  ].join("\n");

  function copy() {
    navigator.clipboard.writeText(specSheet).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => undefined,
    );
  }

  // --- to-scale template geometry (1 inch = 100 units) ---
  const U = 100;
  const W = m.fullW * U;
  const H = m.fullH * U;
  const bx = BLEED * U;
  const tw = m.tw * U;
  const th = m.th * U;
  const sp = m.spine * U;
  const spineX = bx + tw;
  const frontX = spineX + sp;
  const by = BLEED * U;
  const sa = SAFE * U;

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Print Cover Studio</h1>
          <p>
            Work out the spine width and full-wrap dimensions for a paperback cover, to Amazon
            KDP specification. Free, and nothing to sign up for.
          </p>
        </div>
      </div>

      <div className="wrap tk">
        <div className="tk-grid">
          <div>
            <div className="tk-panel">
              <p className="tk-legend">The book</p>
              <label className="tk-field">
                <span>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="tk-field">
                <span>Author</span>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} />
              </label>
              <label className="tk-field">
                <span>Trim size</span>
                <select value={trimKey} onChange={(e) => setTrimKey(e.target.value)}>
                  {Object.keys(TRIM).map((k) => (
                    <option key={k} value={k}>
                      {k} in
                    </option>
                  ))}
                </select>
              </label>
              <label className="tk-field">
                <span>Page count</span>
                <input
                  type="number"
                  min={24}
                  max={828}
                  step={2}
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value, 10) || 24)}
                />
                <input
                  type="range"
                  min={24}
                  max={828}
                  step={2}
                  value={m.pages}
                  onChange={(e) => setPages(parseInt(e.target.value, 10))}
                />
              </label>
              <label className="tk-field">
                <span>Paper</span>
                <select value={paper} onChange={(e) => setPaper(e.target.value)}>
                  {Object.keys(PAPER_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {PAPER_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="tk-panel">
              <p className="tk-legend">Measurements</p>
              <table className="tk-specs">
                <tbody>
                  <tr>
                    <td>Spine width</td>
                    <td>{f(m.spine, 4)} in</td>
                  </tr>
                  <tr>
                    <td>Spine width</td>
                    <td>{f(m.spine * 25.4, 2)} mm</td>
                  </tr>
                  <tr>
                    <td>Full wrap width</td>
                    <td>{f(m.fullW, 3)} in</td>
                  </tr>
                  <tr>
                    <td>Full wrap height</td>
                    <td>{f(m.fullH, 3)} in</td>
                  </tr>
                  <tr>
                    <td>At 300 DPI</td>
                    <td>
                      {px[0]} × {px[1]} px
                    </td>
                  </tr>
                  <tr>
                    <td>Spine text</td>
                    <td>
                      <span className={m.spineText ? "tk-chip ok" : "tk-chip warn"}>
                        {m.spineText ? "Allowed" : "Too thin"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button className="tk-copy" type="button" onClick={copy}>
                {copied ? "Copied" : "Copy spec sheet"}
              </button>
            </div>
          </div>

          <div>
            <div className="tk-stage">
              <div className="tk-stagehead">
                <h2>Full-wrap template</h2>
                <span className="tk-scale">
                  drawn to scale · {f(m.fullW, 3)} × {f(m.fullH, 3)} in
                </span>
              </div>
              <div className="tk-preview">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  role="img"
                  aria-label="Full wrap cover template, drawn to scale"
                >
                  <rect width={W} height={H} fill="var(--tk-paper)" />
                  <rect x={bx} y={by} width={tw} height={th} fill="var(--tk-sunk)" />
                  <rect x={frontX} y={by} width={tw} height={th} fill="var(--tk-pine-soft)" />
                  <rect x={spineX} y={by} width={sp} height={th} fill="var(--tk-pine)" />
                  <rect
                    x={bx + tw - (BARCODE_W + BARCODE_PAD) * U}
                    y={by + th - (BARCODE_H + BARCODE_PAD) * U}
                    width={BARCODE_W * U}
                    height={BARCODE_H * U}
                    fill="none"
                    stroke="var(--tk-reserve)"
                    strokeWidth={3}
                    strokeDasharray="9 7"
                  />
                  {[bx, frontX].map((x) => (
                    <rect
                      key={x}
                      x={x + sa}
                      y={by + sa}
                      width={tw - 2 * sa}
                      height={th - 2 * sa}
                      fill="none"
                      stroke="var(--tk-safe)"
                      strokeWidth={3}
                      strokeDasharray="7 8"
                    />
                  ))}
                  <rect
                    x={bx}
                    y={by}
                    width={tw * 2 + sp}
                    height={th}
                    fill="none"
                    stroke="var(--tk-trim)"
                    strokeWidth={3.5}
                    strokeDasharray="14 9"
                  />
                  {[spineX, frontX].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1={by}
                      x2={x}
                      y2={by + th}
                      stroke="var(--tk-trim)"
                      strokeWidth={3.5}
                      strokeDasharray="14 9"
                    />
                  ))}
                  <text
                    x={frontX + tw / 2}
                    y={by + th * 0.42}
                    textAnchor="middle"
                    fill="var(--tk-ink)"
                    fontSize={tw * 0.085}
                    fontWeight={500}
                    style={{ fontFamily: "var(--tk-serif)" }}
                  >
                    {title}
                  </text>
                  <text
                    x={frontX + tw / 2}
                    y={by + th * 0.52}
                    textAnchor="middle"
                    fill="var(--tk-ink2)"
                    fontSize={tw * 0.045}
                  >
                    {author}
                  </text>
                  <text
                    x={frontX + tw / 2}
                    y={by + th - sa - 10}
                    textAnchor="middle"
                    fill="var(--tk-ink3)"
                    fontSize={tw * 0.03}
                    letterSpacing={tw * 0.006}
                  >
                    MAPLE &amp; PINE PRESS
                  </text>
                  <text
                    x={bx + sa + 14}
                    y={by + sa + 34}
                    fill="var(--tk-ink3)"
                    fontSize={tw * 0.032}
                  >
                    back cover copy
                  </text>
                  {m.spineText ? (
                    <text
                      transform={`translate(${spineX + sp / 2}, ${by + th / 2}) rotate(90)`}
                      textAnchor="middle"
                      fill="var(--tk-paper)"
                      fontSize={Math.min(sp * 0.5, th * 0.035)}
                      fontWeight={500}
                      style={{ fontFamily: "var(--tk-serif)" }}
                    >
                      {title} · {author}
                    </text>
                  ) : null}
                </svg>
              </div>
              <div className="tk-key">
                <span>
                  <i style={{ borderColor: "var(--tk-trim)" }} />
                  trim
                </span>
                <span>
                  <i style={{ borderColor: "var(--tk-safe)" }} />
                  safe margin
                </span>
                <span>
                  <i style={{ borderColor: "var(--tk-reserve)" }} />
                  barcode reserve
                </span>
              </div>
            </div>

            {!m.spineText ? (
              <div className="tk-notice warn">
                Under 79 pages, KDP does not allow text on the spine. Leave it as a solid colour
                or continue the artwork across it.
              </div>
            ) : null}
            {m.spine < 0.0625 ? (
              <div className="tk-notice warn">
                This spine is under 1.6 mm. Artwork that has to line up across the spine will
                drift — keep it forgiving.
              </div>
            ) : null}
          </div>
        </div>

        <p className="tk-foot">
          Spine width is page count × a per-paper factor: white 0.002252, cream 0.0025, premium
          colour 0.002347, standard colour 0.002252. Bleed is 0.125&Prime; on the top, bottom and
          outside edges; the safe margin is 0.125&Prime; inside the trim. Spine text is permitted
          from 79 pages. Export the finished wrap as a single PDF at 300 DPI or better.
        </p>
      </div>
    </SiteLayout>
  );
}
