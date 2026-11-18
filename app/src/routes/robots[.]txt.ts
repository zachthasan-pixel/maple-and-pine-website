import { createFileRoute } from '@tanstack/react-router'

import { SITE_ORIGIN } from '../components/site/seo'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        // Always the one real address, whichever address the request came in on.
        const origin = SITE_ORIGIN
        const body = [
          'User-agent: *',
          'Allow: /',
          // The counts-only stats page is the one address under /api/ that automated
          // readers may open: the weekly site check reads it. The longer rule wins, so
          // everything else under /api/ stays closed. The page itself answers with a
          // "noindex" header, so it stays out of search results.
          'Allow: /api/stats',
          'Disallow: /api/',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
        ].join('\n')
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
