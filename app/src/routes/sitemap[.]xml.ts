import { createFileRoute } from '@tanstack/react-router'

import { CATALOG } from '../components/site/catalog'

// Pages that exist independently of the catalogue.
const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/books', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/submissions', changefreq: 'monthly', priority: '0.6' },
  { path: '/beyond-the-press', changefreq: 'monthly', priority: '0.5' },
  { path: '/toolkit', changefreq: 'monthly', priority: '0.5' },
  { path: '/toolkit/interior-layout', changefreq: 'monthly', priority: '0.4' },
  { path: '/toolkit/print-cover', changefreq: 'monthly', priority: '0.4' },
]

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const today = new Date().toISOString().split('T')[0]

        const entry = (path: string, changefreq: string, priority: string) =>
          [
            '  <url>',
            `    <loc>${escapeXml(origin + path)}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${changefreq}</changefreq>`,
            `    <priority>${priority}</priority>`,
            '  </url>',
          ].join('\n')

        const staticEntries = STATIC_PAGES.map((p) =>
          entry(p.path, p.changefreq, p.priority),
        )

        // One entry per book. Each book's href already points at its own page
        // (/book/<slug>, or a dedicated route for the two titles that have one),
        // so the sitemap stays in step with catalog/catalog.json automatically.
        const seen = new Set(STATIC_PAGES.map((p) => p.path))
        const bookEntries = CATALOG.filter((b) => {
          if (seen.has(b.href)) return false
          seen.add(b.href)
          return true
        }).map((b) => entry(b.href, 'monthly', '0.7'))

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...staticEntries,
          ...bookEntries,
          '</urlset>',
        ].join('\n')

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
