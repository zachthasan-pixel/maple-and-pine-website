import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteLayout } from "../components/site/Layout";
import { submitManuscriptQuery } from "../lib/api/site.functions";

export const Route = createFileRoute("/submissions")({
  head: () => ({
    meta: [
      { title: "Submissions · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Submit your manuscript to Maple & Pine Press. We read every submission: nonfiction on policy, law, and current affairs, and children's picture books.",
      },
    ],
  }),
  component: Submissions,
});

function Submissions() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Nonfiction: Policy / Law / Current Affairs");
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [aiDisclosure, setAiDisclosure] = useState(
    "Entirely my own work, no AI tools used",
  );
  const [priorPublication, setPriorPublication] = useState("Never published before");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [ref, setRef] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubmit() {
    if (
      !name.trim() ||
      !email.trim() ||
      !email.includes("@") ||
      !title.trim() ||
      !pitch.trim() ||
      !rightsConfirmed
    ) {
      setState("err");
      return;
    }
    setState("busy");
    try {
      const res = await submitManuscriptQuery({
        data: {
          name,
          email,
          category,
          title,
          pitch,
          aiDisclosure,
          priorPublication,
          rightsConfirmed: true,
        },
      });
      if ("ref" in res && res.ref) setRef(res.ref);
      setState("ok");
    } catch {
      setState("err");
    }
  }

  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Submissions</h1>
          <p>
            We read every submission we receive, and we respond to all of them. Here is what we
            are looking for, and how to reach us.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="subgrid">
          <div>
            <h2>What We Publish</h2>
            <p>
              <b>Nonfiction:</b> public policy, law, international affairs, education, and
              current events. We favor evidence-based, analytical work written for intelligent
              general readers.
            </p>
            <p>
              <b>Children's picture books:</b> stories for ages 3 to 8 with heart and craft.
              Illustrated or text-only manuscripts are both welcome. We can arrange
              illustration.
            </p>
            <h2 style={{ marginTop: 34 }}>How It Works</h2>
            <ol>
              <li>
                Send us your query using the form: a short pitch, a synopsis, and the first
                chapter (or the full text for picture books).
              </li>
              <li>
                We reply within one week, usually within a few days. If we are interested, we
                request the full manuscript.
              </li>
              <li>
                If we offer publication, we walk you through terms in plain language. No agent
                required, and you keep your copyright.
              </li>
            </ol>
            <p style={{ marginTop: 20, fontStyle: "italic" }}>
              We are a small press and publish selectively. A pass from us is never a judgment
              on your work's worth.
            </p>
          </div>
          <div className="sform">
            {state === "ok" ? (
              <div>
                <h2 style={{ fontFamily: "inherit" }}>Received. Thank you.</h2>
                <p style={{ color: "#4a453e" }}>
                  Your query for <b>{title.trim()}</b> is safely with us. We read everything we
                  receive and will reply to {email.trim()} within the week.
                </p>
                {ref && (
                  <p style={{ color: "#4a453e" }}>
                    Your reference number is <b>{ref}</b>. Keep it: together with your email, it
                    lets you check the status of your submission any time on our Author Toolkit
                    page.
                  </p>
                )}
              </div>
            ) : (
              <>
                <label htmlFor="sub-name">Your Name</label>
                <input
                  id="sub-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
                <label htmlFor="sub-email">Email</label>
                <input
                  id="sub-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <label htmlFor="sub-cat">Category</label>
                <select
                  id="sub-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Nonfiction: Policy / Law / Current Affairs</option>
                  <option>Children's Picture Book</option>
                  <option>Other</option>
                </select>
                <label htmlFor="sub-title">Title of Your Work</label>
                <input
                  id="sub-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Working title"
                />
                <label htmlFor="sub-pitch">Your Pitch (200 words max)</label>
                <textarea
                  id="sub-pitch"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="What is the book, who is it for, and why you?"
                />
                <label htmlFor="sub-ai">Use of AI Tools</label>
                <select
                  id="sub-ai"
                  value={aiDisclosure}
                  onChange={(e) => setAiDisclosure(e.target.value)}
                >
                  <option>Entirely my own work, no AI tools used</option>
                  <option>AI-assisted: I wrote it, AI helped edit or refine</option>
                  <option>Partly AI-generated: some text or images created by AI, edited by me</option>
                  <option>Largely AI-generated: substantial text or images created by AI</option>
                </select>
                <div className="fieldnote">
                  We use the same categories as Amazon, Apple, and Google, so your answer here
                  carries over if your book reaches those stores. AI-assisted work is welcome;
                  we simply need to know.
                </div>
                <label htmlFor="sub-prior">Publication History</label>
                <select
                  id="sub-prior"
                  value={priorPublication}
                  onChange={(e) => setPriorPublication(e.target.value)}
                >
                  <option>Never published before</option>
                  <option>Previously self-published (e.g., on Amazon)</option>
                  <option>Previously published by another press</option>
                  <option>Parts published (blog, journal, or excerpt)</option>
                </select>
                <label className="checkrow" htmlFor="sub-rights">
                  <input
                    id="sub-rights"
                    type="checkbox"
                    checked={rightsConfirmed}
                    onChange={(e) => setRightsConfirmed(e.target.checked)}
                  />
                  <span>
                    I confirm this is my own original work, I hold the rights to it, and it does
                    not infringe anyone else's copyright.
                  </span>
                </label>
                <button className="sbtn" onClick={() => void onSubmit()} disabled={state === "busy"}>
                  {state === "busy" ? "Sending..." : "Submit Query"}
                </button>
                {state === "err" && (
                  <div className="formerr">
                    Please fill in every field, use a valid email, and tick the rights
                    confirmation box.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
