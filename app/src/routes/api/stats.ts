import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";

// Public, counts-only health endpoint for the weekly site steward.
// No personal data is exposed: totals only.
// robots.txt lets automated readers open this one address; the headers below keep it
// out of search results and stop anyone holding on to an old copy of the totals.
const STATS_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async () => {
        const { DB } = bindings();
        if (!DB) {
          return Response.json(
            { ok: false, error: "no database" },
            { status: 503, headers: STATS_HEADERS },
          );
        }
        async function count(table: string): Promise<number> {
          try {
            const row = await DB!
              .prepare(`SELECT COUNT(*) AS n FROM ${table}`)
              .first<{ n: number }>();
            return row?.n ?? 0;
          } catch {
            return -1;
          }
        }
        const [signups, submissions, questions] = await Promise.all([
          count("newsletter_signups"),
          count("manuscript_submissions"),
          count("assistant_questions"),
        ]);
        return Response.json(
          {
            ok: true,
            site: "Maple & Pine Press",
            newsletter_signups: signups,
            manuscript_submissions: submissions,
            assistant_questions: questions,
          },
          { headers: STATS_HEADERS },
        );
      },
    },
  },
});
