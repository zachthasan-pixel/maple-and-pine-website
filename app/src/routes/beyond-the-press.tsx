import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/beyond-the-press")({
  head: () => ({
    meta: [
      { title: "Beyond the Press · Hasan Publishing" },
      {
        name: "description",
        content:
          "Other projects from Dr. Zahir Hasan: Movement for Action, Discoverly, BookVoice, and Foldbird.",
      },
    ],
  }),
  component: BeyondThePress,
});

const PROJECTS = [
  {
    name: "Movement for Action",
    url: "https://www.movementforaction.org",
    tag: "Nonprofit",
    blurb:
      "The nonprofit founded by Dr. Hasan. Learn about its mission, follow its work, and support it with a donation.",
    initials: "MA",
    tint: "#3c5f33",
  },
  {
    name: "Discoverly",
    url: "https://trydiscoverly.com",
    tag: "For Authors",
    blurb:
      "A platform that helps independent and academic authors get their books discovered: it analyzes and improves listings on Amazon, Apple, and Google, and helps authors build a direct readership.",
    initials: "D",
    tint: "#8c2f22",
  },
  {
    name: "BookVoice",
    url: "https://bookvoice-studio.netlify.app",
    tag: "Audiobooks",
    blurb:
      "A studio for independent authors that turns a finished manuscript into a professionally narrated audiobook in an afternoon: no recording studio, no narrator fee, no technical skills required.",
    initials: "BV",
    tint: "#8a7440",
  },
  {
    name: "Foldbird",
    url: "https://foldbird.higgsfield.app",
    tag: "Storytelling App",
    blurb:
      "An app that turns written manuscripts into narrated, illustrated films, with a choice of audience and artistic style and consistent characters throughout.",
    initials: "F",
    tint: "#2e6f8e",
  },
];

function BeyondThePress() {
  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Beyond the Press</h1>
          <p>
            Hasan Publishing is one part of a wider body of work. These are the other projects
            Dr. Hasan leads, each with its own home on the web.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="xgrid">
          {PROJECTS.map((p) => (
            <div className="xcard" key={p.name}>
              <div className="xhead">
                <div className="xinit" style={{ background: p.tint }}>
                  {p.initials}
                </div>
                <div>
                  <span className="xtag" style={{ color: p.tint }}>
                    {p.tag}
                  </span>
                  <h3>{p.name}</h3>
                </div>
              </div>
              <p className="xblurb">{p.blurb}</p>
              <a className="xvisit" href={p.url} target="_blank" rel="noreferrer">
                Visit {p.name} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
