// Social-share (Open Graph / Twitter card) helpers for mapleandpinepress.com.
//
// LinkedIn, X, Facebook and most chat apps only follow ABSOLUTE image URLs in
// og:image / twitter:image, so every share image is resolved against the
// production origin here rather than left root-relative.

export const SITE_URL = "https://mapleandpinepress.com";
export const SITE_NAME = "Maple & Pine Press";
/** Dr. Zahir Hasan's X account, credited as the card's creator. */
export const TWITTER_CREATOR = "@ZachHasan";
/** Press-wide fallback share image (1536×1024). */
export const DEFAULT_SHARE_IMAGE = "/assets/og-cover.png";

/** Resolve a root-relative path (or already-absolute URL) to an absolute https URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, SITE_URL).toString();
}

type SocialMetaInput = {
  title: string;
  description: string;
  /** Page path, e.g. "/book/elbows-up". */
  path: string;
  /** Root-relative or absolute image; defaults to the press share image. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "book" | "article";
};

/**
 * Per-page og:/twitter: tags. Child-route tags replace the root defaults with
 * the same name/property, so a page only has to list what it overrides.
 */
export function socialMeta({
  title,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
  imageAlt,
  type = "website",
}: SocialMetaInput) {
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  return [
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    ...(imageAlt ? [{ property: "og:image:alt", content: imageAlt }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: TWITTER_CREATOR },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
    ...(imageAlt ? [{ name: "twitter:image:alt", content: imageAlt }] : []),
  ];
}

/** Canonical link for a page path. */
export function canonicalLink(path: string) {
  return { rel: "canonical", href: absoluteUrl(path) };
}

/** Trim a description to a share-card friendly length on a word boundary. */
export function shareDescription(text: string, max = 200): string {
  // Store blurbs carry light markdown (*italic* titles); share cards are plain text.
  const clean = text.replace(/[*_]+/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
