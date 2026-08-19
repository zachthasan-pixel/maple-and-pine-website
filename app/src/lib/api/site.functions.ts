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

const PRESS_KNOWLEDGE = `You are the Press Assistant for Maple & Pine Press, a small independent book publisher in Tokyo founded by Dr. Zahir Hasan (a Canadian academic; the maple in the name stands for Canada, the pine for Japan).

Facts you may share:
- Catalog: "A Manufactured War: The Israeli and American Assault on Iran" by Zahir Hasan (the press's newest lead title, updated through August 2026 with six new chapters; 132 pages; ebook and paperback; on sale now at Amazon worldwide including Amazon Japan). "The Arab Dilemma" by Zahir Hasan (2026, nonfiction on Gaza and Middle East politics; ebook and paperback; available on Amazon, with Apple Books and Google Play editions coming). Children's picture books: "Tasneem's Glider" and "The Spiderweb Mystery" by Zahir Hasan, for ages 4 to 8.
- Authors can submit manuscripts on the Submissions page of this website (mapleandpinepress.com/submissions): a short pitch, synopsis, and first chapter. The press replies within one week, usually within a few days; no literary agent is required, and authors keep their copyright. The press publishes nonfiction (policy, law, international affairs, education) and children's picture books.
- The submission form asks about AI use (same categories as Amazon KDP: fully original, AI-assisted, partly or largely AI-generated), publication history, and a confirmation that the author holds the rights to the work. AI-assisted writing is welcome; the press simply asks for honesty, and these answers carry over when a book is later listed on Amazon, Apple, or Google.
- The free Author Toolkit page (mapleandpinepress.com/toolkit) offers: a Title & Name Checker that searches public book catalogs and links to trademark registries; a Cover Concept Studio that generates draft AI cover art in Amazon's ebook dimensions (limited free uses per day; AI art must be declared if published); a royalty and print calculator; and submission status lookup using the reference number from the submission confirmation.
- Readers can join the newsletter on the home page to hear about new releases.
- Contact: the "Email the Press" link in the website footer.
- Other projects by the founder: Movement for Action (nonprofit), Discoverly, BookVoice, Foldbird (see the "Beyond the Press" page).

Rules: answer in 1-3 short, warm, plain sentences. Only answer questions about the press, its books, submissions, or the founder's public projects. If asked anything else (politics, personal data, technical topics, other companies), politely say you can only help with questions about Maple & Pine Press and suggest the contact link. Never invent prices, dates, or titles not listed above.`;

// Press Assistant chat: answers via Workers AI, logs the question.
export const askPressAssistant = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().trim().min(1).max(600),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1200) }))
        .max(8)
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { DB, AI } = bindings();
    if (DB) {
      try {
        await DB.prepare("INSERT INTO assistant_questions (question) VALUES (?)")
          .bind(data.question)
          .run();
      } catch {
        // Logging must never break the answer.
      }
    }
    const fallback =
      "I am sorry, I could not reach my knowledge just now. For anything about our books or submissions, please use the Submissions page or the Email the Press link in the footer.";
    if (!AI) {
      console.error("assistant: AI binding missing");
      return { answer: fallback };
    }
    try {
      const result = await AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: PRESS_KNOWLEDGE },
          ...(data.history ?? []).slice(-6),
          { role: "user", content: data.question },
        ],
        max_tokens: 300,
      });
      const answer = (result.response ?? "").trim();
      if (answer.length === 0) console.error("assistant: empty AI response", JSON.stringify(result).slice(0, 300));
      return { answer: answer.length > 0 ? answer : fallback };
    } catch (e) {
      console.error("assistant: AI call failed", String(e).slice(0, 300));
      return { answer: fallback };
    }
  });

// Title & Name Checker: searches public book databases for collisions.
export const checkTitle = createServerFn({ method: "POST" })
  .inputValidator(z.object({ q: z.string().trim().min(2).max(150) }))
  .handler(async ({ data }) => {
    type Match = { title: string; author: string; year: string; source: string };
    const matches: Match[] = [];
    const q = data.q;
    const [gb, ol] = await Promise.allSettled([
      fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(`"${q}"`)}&maxResults=8`,
      ).then((r) => r.json() as Promise<{ items?: Array<{ volumeInfo?: { title?: string; authors?: string[]; publishedDate?: string } }> }>),
      fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=8&fields=title,author_name,first_publish_year`,
      ).then((r) => r.json() as Promise<{ docs?: Array<{ title?: string; author_name?: string[]; first_publish_year?: number }> }>),
    ]);
    if (gb.status === "fulfilled") {
      for (const it of gb.value.items ?? []) {
        const v = it.volumeInfo ?? {};
        if (v.title)
          matches.push({
            title: v.title,
            author: (v.authors ?? []).join(", ") || "Unknown author",
            year: (v.publishedDate ?? "").slice(0, 4),
            source: "Google Books",
          });
      }
    }
    if (ol.status === "fulfilled") {
      for (const d of ol.value.docs ?? []) {
        if (d.title)
          matches.push({
            title: d.title,
            author: (d.author_name ?? []).join(", ") || "Unknown author",
            year: d.first_publish_year ? String(d.first_publish_year) : "",
            source: "Open Library",
          });
      }
    }
    // Dedupe by normalized title + author.
    const seen = new Set<string>();
    const unique = matches.filter((m) => {
      const k = (m.title + "|" + m.author).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // Closest matches first: exact title matches to the top.
    const ql = q.toLowerCase();
    unique.sort((a, b) => {
      const ax = a.title.toLowerCase() === ql ? 0 : 1;
      const bx = b.title.toLowerCase() === ql ? 0 : 1;
      return ax - bx;
    });
    return { matches: unique.slice(0, 12) };
  });

// Cover Concept Studio: generates draft cover art (daily-capped).
const COVER_DAILY_CAP = 24;
export const generateCoverArt = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      mood: z.string().trim().min(2).max(200),
    }),
  )
  .handler(async ({ data }) => {
    const { DB, AI } = bindings();
    if (!AI) return { ok: false as const, reason: "unavailable" as const };
    if (DB) {
      try {
        const day = new Date().toISOString().slice(0, 10);
        await DB.prepare(
          "INSERT INTO daily_counters (day, name, n) VALUES (?, 'cover', 1) ON CONFLICT(day, name) DO UPDATE SET n = n + 1",
        )
          .bind(day)
          .run();
        const row = await DB.prepare(
          "SELECT n FROM daily_counters WHERE day = ? AND name = 'cover'",
        )
          .bind(day)
          .first<{ n: number }>();
        if ((row?.n ?? 0) > COVER_DAILY_CAP) {
          return { ok: false as const, reason: "cap" as const };
        }
      } catch {
        // Counting must not break the tool.
      }
    }
    const prompt = `Professional book cover background artwork. Atmosphere and subject: ${data.mood}. Painterly, dramatic lighting, strong composition with quiet space near the top and bottom for typography. Absolutely no text, no letters, no words, no typography in the image.`;
    const models: Array<{ id: string; options: Record<string, unknown> }> = [
      {
        id: "@cf/bytedance/stable-diffusion-xl-lightning",
        options: {
          prompt,
          width: 768,
          height: 1024,
          negative_prompt: "text, letters, words, typography, watermark, signature",
        },
      },
      { id: "@cf/black-forest-labs/flux-1-schnell", options: { prompt, steps: 6 } },
    ];
    for (const m of models) {
      try {
        const result: unknown = await (
          AI as unknown as { run: (id: string, o: unknown) => Promise<unknown> }
        ).run(m.id, m.options);
        if (result instanceof ReadableStream) {
          const buf = new Uint8Array(await new Response(result).arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i += 8192) {
            bin += String.fromCharCode(...buf.subarray(i, i + 8192));
          }
          return { ok: true as const, image: btoa(bin) };
        }
        if (
          result &&
          typeof result === "object" &&
          "image" in result &&
          typeof (result as { image?: string }).image === "string"
        ) {
          return { ok: true as const, image: (result as { image: string }).image };
        }
      } catch {
        // Try the next model.
      }
    }
    return { ok: false as const, reason: "unavailable" as const };
  });

// Submission status lookup by reference number + email.
export const checkSubmissionStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ref: z.string().trim().min(4).max(20),
      email: z.string().trim().email().max(254),
    }),
  )
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { found: false as const };
    const row = await DB.prepare(
      "SELECT status, created_at, title FROM manuscript_submissions WHERE ref = ? AND email = ?",
    )
      .bind(data.ref.toUpperCase(), data.email.toLowerCase())
      .first<{ status: string | null; created_at: string; title: string }>();
    if (!row) return { found: false as const };
    return {
      found: true as const,
      status: row.status ?? "received",
      submitted: row.created_at,
      title: row.title,
    };
  });

function makeSubmissionRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return "MP-" + s;
}

// Manuscript query from the Submissions page.
export const submitManuscriptQuery = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(254),
      category: z.string().trim().min(1).max(100),
      title: z.string().trim().min(1).max(300),
      pitch: z.string().trim().min(1).max(4000),
      aiDisclosure: z.string().trim().min(1).max(200),
      priorPublication: z.string().trim().min(1).max(200),
      rightsConfirmed: z.literal(true),
    }),
  )
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { ok: false as const };
    const ref = makeSubmissionRef();
    await DB.prepare(
      "INSERT INTO manuscript_submissions (name, email, category, title, pitch, ai_disclosure, rights_confirmed, prior_publication, ref, status) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'received')",
    )
      .bind(
        data.name,
        data.email.toLowerCase(),
        data.category,
        data.title,
        data.pitch,
        data.aiDisclosure,
        data.priorPublication,
        ref,
      )
      .run();
    return { ok: true as const, ref };
  });
