import type { BookStores } from "./catalog";

const STORES: { key: keyof BookStores; label: string }[] = [
  { key: "apple", label: "Apple Books" },
  { key: "googlePlay", label: "Google Play Books" },
];

/**
 * Apple Books / Google Play Books buttons for one title. Data-driven from
 * catalog.json `stores`: a store with no verified listing (null) renders
 * nothing, so a title with neither link shows only its Amazon button(s).
 */
export function StoreLinks({
  stores,
  title,
  className,
}: {
  stores: BookStores;
  title: string;
  /** Button class, to match the surrounding page's Amazon button. */
  className: string;
}) {
  return (
    <>
      {STORES.map(({ key, label }) => {
        const href = stores[key];
        if (!href) return null;
        return (
          <a
            key={key}
            className={className}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buy ${title} on ${label} (opens in a new tab)`}
          >
            {label}
          </a>
        );
      })}
    </>
  );
}
