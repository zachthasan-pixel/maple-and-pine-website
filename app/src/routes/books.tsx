import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteLayout } from "../components/site/Layout";
import { CATALOG, CatalogCard } from "../components/site/catalog";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "The Catalog · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Every book published by Maple & Pine Press: politics and international affairs, education and practice, fantasy and speculative fiction, and illustrated children's books.",
      },
    ],
  }),
  component: Books,
});

const FILTERS = [
  { key: "all", label: "All Titles" },
  { key: "policy", label: "Politics & International Affairs" },
  { key: "practice", label: "Education & Practice" },
  { key: "fiction", label: "Fantasy & Speculative Fiction" },
  { key: "kids", label: "Children's Books" },
] as const;

function Books() {
  const [filter, setFilter] = useState<string>("all");
  const shown = CATALOG.filter((b) => filter === "all" || b.filter === filter);
  const count = shown.length;

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>The Catalog</h1>
          <p>
            Every book we publish, across all four of our lists. Each title has its own page
            with publication details and where to buy.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`fbtn ${filter === f.key ? "on" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="catcount">
          {count} {count === 1 ? "title" : "titles"}
        </p>
        <div className="grid" style={{ paddingBottom: 72 }}>
          {shown.map((book) => (
            <CatalogCard key={book.slug} book={book} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
