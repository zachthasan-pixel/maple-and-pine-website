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
