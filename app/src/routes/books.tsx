import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteLayout } from "../components/site/Layout";
import { CATALOG, CatalogCard } from "../components/site/catalog";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "The Catalog · Hasan Publishing" },
      {
        name: "description",
        content:
          "Every book published by Hasan Publishing: nonfiction on policy and international affairs, and illustrated children's books.",
      },
    ],
  }),
  component: Books,
});

const FILTERS = [
  { key: "all", label: "All Titles" },
  { key: "policy", label: "Politics & Current Affairs" },
  { key: "kids", label: "Children's Books" },
  { key: "soon", label: "Forthcoming" },
] as const;

function Books() {
  const [filter, setFilter] = useState<string>("all");
  const shown = CATALOG.filter((b) => filter === "all" || b.filter === filter);

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>The Catalog</h1>
          <p>
            Every book we publish, across both of our lists. Each title page includes a full
            description, publication details, and where to buy.
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
        <div className="grid" style={{ paddingBottom: 72 }}>
          {shown.map((book) => (
            <CatalogCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
