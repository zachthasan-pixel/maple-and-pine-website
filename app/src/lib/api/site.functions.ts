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
- Catalog: "The Arab Dilemma" by Zahir Hasan (2026, nonfiction on Gaza and Middle East politics; ebook and paperback; available on Amazon, with Apple Books and Google Play editions coming). Children's picture books: "Tasneem's Glider" and "The Spiderweb Mystery" by Zahir Hasan, for ages 4 to 8.
- Authors can submit manuscripts on the Submissions page of this website (mapleandpinepress.com/submissions): a short pitch, synopsis, and first chapter. The press replies within 6 to 8 weeks, no literary agent is required, and authors keep their copyright. The press publishes nonfiction (policy, law, international affairs, education) and children's picture books.
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
