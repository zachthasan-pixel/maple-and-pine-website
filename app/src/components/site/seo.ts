// What search engines and link previews are told about each page.
//
// The site can be reached at more than one address (with or without "www", and on
// preview hosts). Every page names ONE address as the real one, so search engines
// never have to guess. server.ts sends visitors on the other addresses to it.

export const SITE_HOST = "mapleandpinepress.com";
export const SITE_ORIGIN = `https://${SITE_HOST}`;
export const SITE_NAME = "Maple & Pine Press";
export const AUTHOR_SITE = "https://drzahirhasan.com/";
export const AUTHOR_AMAZON_PAGE = "https://www.amazon.com/stores/author/B0H97YZ9GT";

const TITLE_SUFFIX = ` · ${SITE_NAME}`;
const DEFAULT_IMAGE = "/assets/og-cover.png";

// Search results cut a title at about 60 characters and a description at about 155.
const TITLE_MAX = 60;
const DESC_MAX = 155;

/** A full address on the real site for a path such as "/books". */
export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path}`;
}

/** "Page name · Maple & Pine Press", or the page name alone when that would be cut off. */
export function pageTitle(name: string): string {
  return (name + TITLE_SUFFIX).length <= TITLE_MAX ? name + TITLE_SUFFIX : name;
}

/** As many whole sentences from the start of a text as fit in `max` characters. */
function wholeSentences(text: string, max: number): string {
  const pieces = text.split(/(?<=[.!?]["”’)]?)\s+(?=[A-Z0-9"“‘(])/);
  const sentences: string[] = [];
  for (const piece of pieces) {
    const last = sentences[sentences.length - 1];
    // "Dr." and friends do not end a sentence
    if (last !== undefined && /\b(Dr|Mr|Mrs|Ms|St|vs|No)\.$/.test(last)) {
      sentences[sentences.length - 1] = `${last} ${piece}`;
    } else {
      sentences.push(piece);
    }
  }
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  return out;
}

/**
 * A description that fits in a search result: whole sentences from the text as
 * written. Only when the opening sentence alone is too long is it cut at a word.
 */
export function metaDescription(parts: string | string[]): string {
  const text = (Array.isArray(parts) ? parts.join(" ") : parts)
    .replace(/\*+/g, "")
    .replace(/\s+/g, " ")
    .replace(/([a-z!?])\.([A-Z])/g, "$1. $2")
    .trim();
  if (text.length <= DESC_MAX) return text;
  const out = wholeSentences(text, DESC_MAX);
  if (out.length >= 70) return out;
  const cut = text.slice(0, DESC_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "")}…`;
}

type PageHeadInput = {
  /** The browser tab and search result title, written in full. */
  title: string;
  description: string;
  /** The page's path on the site, starting with "/". */
  path: string;
  /** Picture for link previews; the press's own card when a page has none. */
  image?: string;
  type?: "website" | "book";
};

/** The head of one page: title, description, its one real address, and its link preview. */
export function pageHead({ title, description, path, image, type = "website" }: PageHeadInput) {
  const url = absoluteUrl(path);
  const picture = absoluteUrl(image ?? DEFAULT_IMAGE);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { property: "og:image", content: picture },
      { name: "twitter:image", content: picture },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
