import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/toolkit/interior-layout")({
  head: () => ({
    meta: [
      { title: "Interior Layout Studio · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Set the margins for a paperback interior so the text clears the binding and nothing is trimmed off. A free tool from Maple & Pine Press.",
      },
    ],
  }),
  component: InteriorLayoutStudio,
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
const BLEED = 0.125;

// KDP inside (gutter) margin grows with page count — a thicker book curves more.
function gutterFor(pages: number) {
  if (pages <= 150) return 0.375;
  if (pages <= 300) return 0.5;
  if (pages <= 500) return 0.625;
  if (pages <= 700) return 0.75;
  return 0.875;
}

const f = (n: number, d: number) => n.toFixed(d);

function InteriorLayoutStudio() {
  const [trimKey, setTrimKey] = useState("6 × 9");
  const [pages, setPages] = useState(268);
  const [bleed, setBleed] = useState(false);
  const [extra, setExtra] = useState(0.25);
  const [copied, setCopied] = useState(false);

  const m = useMemo(() => {
    const [tw, th] = TRIM[trimKey];
    const p = Math.min(828, Math.max(24, pages || 24));
    const minOuter = bleed ? 0.375 : 0.25;
    const gut = gutterFor(p);
    const outer = minOuter + extra;
    return {
      tw,
      th,
      pages: p,
      gut,
      outer,
      minOuter,
      pageW: tw + (bleed ? BLEED : 0),
      pageH: th + (bleed ? BLEED * 2 : 0),
      blockW: tw - gut - outer,
      blockH: th - outer * 2,
    };
  }, [trimKey, pages, bleed, extra]);

  const tight = m.outer <= m.minOuter;

  const specSheet = [
    `Interior layout — trim ${trimKey} in · ${m.pages} pp`,
    `Inside (gutter) margin ${f(m.gut, 3)} in (${f(m.gut * 25.4, 1)} mm)`,
    `Outer / top / bottom margin ${f(m.outer, 3)} in`,
    `Text block ${f(m.blockW, 3)} × ${f(m.blockH, 3)} in`,
    `Page size ${f(m.pageW, 3)} × ${f(m.pageH, 3)} in${bleed ? " (bleed)" : " (no bleed)"}`,
    "Export at 300 DPI or better",
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

  // --- to-scale spread geometry (1 inch = 100 units) ---
  const U = 100;
  const gap = 0.22 * U;
  const pw = m.tw * U;
  const ph = m.th * U;
  const bl = bleed ? BLEED * U : 0;
  const W = pw * 2 + gap + bl * 2;
  const H = ph + bl * 2;

  const sheets = [
    { x: bl, gutterRight: true, folio: String(m.pages), label: "LEFT PAGE" },
    { x: bl + pw + gap, gutterRight: false, folio: String(m.pages + 1), label: "RIGHT PAGE" },
  ];

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Interior Layout Studio</h1>
          <p>
            Set the margins for a paperback interior so the text clears the binding and nothing
            is trimmed off. Free, and nothing to sign up for.
          </p>
        </div>
      </div>

      <div className="wrap tk">
        <div className="tk-grid">
          <div>
            <div className="tk-panel">
              <p className="tk-legend">The book block</p>
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
                <span className="tk-hint">
                  gutter {f(m.gut, 3)} in ({f(m.gut * 25.4, 1)} mm)
                </span>
              </label>
              <label className="tk-check">
                <input
                  type="checkbox"
                  checked={bleed}
                  onChange={(e) => setBleed(e.target.checked)}
                />
                <span>Images run to the edge (bleed)</span>
              </label>
              <label className="tk-field">
                <span>Outer margin</span>
                <select value={extra} onChange={(e) => setExtra(parseFloat(e.target.value))}>
                  <option value={0}>KDP minimum</option>
                  <option value={0.125}>Minimum + 0.125&Prime;</option>
                  <option value={0.25}>Comfortable (+0.25&Prime;)</option>
                  <option value={0.5}>Generous (+0.5&Prime;)</option>
                </select>
                <span className="tk-hint">Amazon&rsquo;s minimum is tight for reading.</span>
              </label>
            </div>

            <div className="tk-panel">
              <p className="tk-legend">Measurements</p>
              <table className="tk-specs">
                <tbody>
                  <tr>
                    <td>Inside (gutter)</td>
                    <td>{f(m.gut, 3)} in</td>
                  </tr>
                  <tr>
                    <td>Outer / top / bottom</td>
                    <td>{f(m.outer, 3)} in</td>
                  </tr>
                  <tr>
                    <td>Text block width</td>
                    <td>{f(m.blockW, 3)} in</td>
                  </tr>
                  <tr>
                    <td>Text block height</td>
                    <td>{f(m.blockH, 3)} in</td>
                  </tr>
                  <tr>
                    <td>Page size{bleed ? " · bleed" : ""}</td>
                    <td>
                      {f(m.pageW, 3)}×{f(m.pageH, 3)} in
                    </td>
                  </tr>
                  <tr>
                    <td>Margins</td>
                    <td>
                      <span className={tight ? "tk-chip warn" : "tk-chip ok"}>
                        {tight ? "At minimum" : "Comfortable"}
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
                <h2>Spread — left page and right page</h2>
                <span className="tk-scale">
                  drawn to scale · {f(m.pageW, 3)} × {f(m.pageH, 3)} in per page
                </span>
              </div>
              <div className="tk-preview">
                <svg
                  viewBox={`0 0 ${W} ${H + 42}`}
                  role="img"
                  aria-label="Two-page spread showing gutter and text block, drawn to scale"
                >
                  {bleed
                    ? sheets.map((s) => (
                        <rect
                          key={`bleed-${s.x}`}
                          x={s.x - bl}
                          y={0}
                          width={pw + bl * 2}
                          height={H}
                          fill="var(--tk-rule)"
                          opacity={0.5}
                        />
                      ))
                    : null}
                  {sheets.map((s) => {
                    const blockX = s.gutterRight ? s.x + m.outer * U : s.x + m.gut * U;
                    const gutX = s.gutterRight ? s.x + pw - m.gut * U : s.x + m.gut * U;
                    const bw = m.blockW * U;
                    const bh = m.blockH * U;
                    const byy = bl + m.outer * U;
                    const lh = Math.max(7, bh / 26);
                    const lines = Math.max(0, Math.floor(bh / lh) - 1);
                    return (
                      <g key={s.label}>
                        <rect x={s.x} y={bl} width={pw} height={ph} fill="var(--tk-sheet)" />
                        <rect
                          x={blockX}
                          y={byy}
                          width={bw}
                          height={bh}
                          fill="var(--tk-textblock)"
                        />
                        {Array.from({ length: lines }, (_, l) => (
                          <rect
                            key={l}
                            x={blockX}
                            y={byy + 6 + l * lh}
                            width={(l === 0 ? 0.55 : l % 7 === 6 ? 0.62 : 0.96) * bw}
                            height={lh * 0.34}
                            fill="var(--tk-ink3)"
                            opacity={0.38}
                            rx={1}
                          />
                        ))}
                        <rect
                          x={blockX}
                          y={byy}
                          width={bw}
                          height={bh}
                          fill="none"
                          stroke="var(--tk-safe)"
                          strokeWidth={3}
                          strokeDasharray="7 8"
                        />
                        <line
                          x1={gutX}
                          y1={bl}
                          x2={gutX}
                          y2={bl + ph}
                          stroke="var(--tk-gutter)"
                          strokeWidth={3.5}
                          strokeDasharray="12 8"
                        />
                        <rect
                          x={s.x}
                          y={bl}
                          width={pw}
                          height={ph}
                          fill="none"
                          stroke="var(--tk-trim)"
                          strokeWidth={3.5}
                          strokeDasharray="14 9"
                        />
                        <text
                          x={blockX + bw / 2}
                          y={bl + ph - m.outer * U * 0.35}
                          textAnchor="middle"
                          fill="var(--tk-ink3)"
                          fontSize={pw * 0.035}
                          style={{ fontFamily: "var(--tk-serif)" }}
                        >
                          {s.folio}
                        </text>
                        <text
                          x={s.x + pw / 2}
                          y={bl + ph + bl + 28}
                          textAnchor="middle"
                          fill="var(--tk-ink3)"
                          fontSize={pw * 0.032}
                          letterSpacing={pw * 0.005}
                        >
                          {s.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="tk-key">
                <span>
                  <i style={{ borderColor: "var(--tk-trim)" }} />
                  trim
                </span>
                <span>
                  <i style={{ borderColor: "var(--tk-gutter)" }} />
                  gutter (binding)
                </span>
                <span>
                  <i style={{ borderColor: "var(--tk-safe)" }} />
                  text block
                </span>
              </div>
            </div>

            {m.blockW < 3 ? (
              <div className="tk-notice bad">
                The text block is under 3 inches wide. Lines this short are hard to read — reduce
                the outer margin or choose a wider trim.
              </div>
            ) : null}
            {tight ? (
              <div className="tk-notice warn">
                These are Amazon&rsquo;s bare minimums. They pass the file checker but the text
                sits close to the edge; add 0.25&Prime; if the book is meant to be read
                comfortably.
              </div>
            ) : null}
            {bleed ? (
              <div className="tk-notice ok">
                With bleed, build every page at {f(m.pageW, 3)} × {f(m.pageH, 3)} in and run
                artwork past the red trim line. Anything inside the blue box is safe.
              </div>
            ) : null}
            {m.pages > 500 ? (
              <div className="tk-notice warn">
                At {m.pages} pages the binding curve is significant. Check a physical proof
                before ordering a run.
              </div>
            ) : null}
          </div>
        </div>

        <p className="tk-foot">
          The inside margin grows with the page count because a thicker book curves more at the
          spine: 24–150 pp → 0.375&Prime;, 151–300 → 0.5&Prime;, 301–500 → 0.625&Prime;, 501–700
          → 0.75&Prime;, 701–828 → 0.875&Prime;. Outer, top and bottom minimums are 0.25&Prime;
          without bleed and 0.375&Prime; with it. Bleed adds 0.125&Prime; to the top, bottom and
          outer edge of every page.
        </p>
      </div>
    </SiteLayout>
  );
}
