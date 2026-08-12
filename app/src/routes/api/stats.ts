import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";

// Public, counts-only health endpoint for the weekly site steward.
// No personal data is exposed: totals only.
export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async () => {
        const { DB } = bindings();
        if (!DB) {
          return Response.json({ ok: false, error: "no database" }, { status: 503 });
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
        return Response.json({
          ok: true,
          site: "Maple & Pine Press",
          newsletter_signups: signups,
          manuscript_submissions: submissions,
          assistant_questions: questions,
        });
      },
    },
  },
});
