import { Link } from "@tanstack/react-router";

export type CatalogEntry = {
  id: string;
  title: string;
  meta: string;
  pill: string;
  pillClass: "policy" | "kids" | "soon";
  filter: "policy" | "kids" | "soon";
  coverImg?: string;
  coverClass?: string;
  coverTag?: string;
  href?: string;
};

export const CATALOG: CatalogEntry[] = [
  {
    id: "manufactured-war",
    title: "A Manufactured War",
    meta: "Zahir Hasan · Updated Aug 2026 · Ebook & Paperback",
    pill: "Politics & Current Affairs",
    pillClass: "policy",
    filter: "policy",
    coverImg: "/assets/manufactured-war-cover.jpg",
    href: "/a-manufactured-war",
  },
  {
    id: "arab-dilemma",
    title: "The Arab Dilemma",
    meta: "Zahir Hasan · 2026 · Ebook & Paperback",
    pill: "Politics & Current Affairs",
    pillClass: "policy",
    filter: "policy",
    coverImg: "/assets/arab-dilemma-cover.jpg",
    href: "/the-arab-dilemma",
  },
  {
    id: "tasneems-glider",
    title: "Tasneem's Glider",
    meta: "Zahir Hasan · Illustrated · Ages 4 to 8",
    pill: "Children's",
    pillClass: "kids",
    filter: "kids",
    coverClass: "cov-glider",
    coverTag: "A Picture Book",
  },
  {
    id: "spiderweb-mystery",
    title: "The Spiderweb Mystery",
    meta: "Zahir Hasan · Illustrated · Ages 4 to 8",
    pill: "Children's",
    pillClass: "kids",
    filter: "kids",
    coverClass: "cov-spider",
    coverTag: "A Picture Book",
  },
  {
    id: "forthcoming",
    title: "Next From the Press",
    meta: "Announcements via our newsletter",
    pill: "Forthcoming",
    pillClass: "soon",
    filter: "soon",
    coverClass: "cov-soon",
    coverTag: "In Preparation",
  },
];

export function CatalogCard({ book }: { book: CatalogEntry }) {
  const inner = (
    <>
      {book.coverImg ? (
        <div className="cover">
          <img src={book.coverImg} alt={`${book.title} cover`} />
        </div>
      ) : (
        <div className={`cover mock ${book.coverClass ?? ""}`}>
          <div className="mtag" style={book.filter === "soon" ? { opacity: 0.9 } : undefined}>
            {book.coverTag}
          </div>
          <div
            className="mtit"
            style={book.filter === "soon" ? { color: "#8a7440" } : undefined}
          >
            {book.filter === "soon" ? "Your Next Title" : book.title}
          </div>
          <div
            className="mauth"
            style={book.filter === "soon" ? { color: "#8a7440", opacity: 1 } : undefined}
          >
            {book.filter === "soon" ? "Coming Soon" : "Zahir Hasan"}
          </div>
        </div>
      )}
      <span className={`pill ${book.pillClass}`}>{book.pill}</span>
      <h3>{book.title}</h3>
      <div className="meta">{book.meta}</div>
    </>
  );

  if (book.href) {
    return (
      <Link to={book.href} className="card">
        {inner}
      </Link>
    );
  }
  return <div className="card">{inner}</div>;
}
