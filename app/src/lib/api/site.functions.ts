import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

// Newsletter signup: stores the address once (repeat signups are ignored).
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().email().max(254) }))
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { ok: false as const };
    await DB.prepare("INSERT OR IGNORE INTO newsletter_signups (email) VALUES (?)")
      .bind(data.email.toLowerCase())
      .run();
    return { ok: true as const };
  });

// Manuscript query from the Submissions page.
export const submitManuscriptQuery = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(254),
      category: z.string().trim().min(1).max(100),
      title: z.string().trim().min(1).max(300),
      pitch: z.string().trim().min(1).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { ok: false as const };
    await DB.prepare(
      "INSERT INTO manuscript_submissions (name, email, category, title, pitch) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(data.name, data.email.toLowerCase(), data.category, data.title, data.pitch)
      .run();
    return { ok: true as const };
  });
