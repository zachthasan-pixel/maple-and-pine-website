import { useRef, useState } from "react";

import { askPressAssistant } from "../../lib/api/site.functions";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hello! I am the Press Assistant. Ask me about our books, where to buy them, or how to submit your manuscript.",
};

export function PressAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);

  function scrollLog() {
    requestAnimationFrame(() => {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async function send() {
    const question = draft.trim();
    if (!question || busy) return;
    const nextMessages: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    scrollLog();
    try {
      const res = await askPressAssistant({
        data: { question, history: nextMessages.slice(-7, -1) },
      });
      setMessages([...nextMessages, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Something went wrong on my end. Please try again, or use the Email the Press link in the footer.",
        },
      ]);
    } finally {
      setBusy(false);
      scrollLog();
    }
  }

  return (
    <div className="pa-root">
      {open && (
        <div className="pa-panel" role="dialog" aria-label="Press Assistant chat">
          <div className="pa-head">
            <div>
              <div className="pa-title">Press Assistant</div>
              <div className="pa-sub">Maple &amp; Pine Press</div>
            </div>
            <button className="pa-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>
          <div className="pa-log" ref={logRef}>
            {messages.map((m, i) => (
              <div key={i} className={`pa-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="pa-msg assistant pa-busy">Thinking...</div>}
          </div>
          <div className="pa-inputrow">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="Type your question"
              aria-label="Your question"
              maxLength={600}
            />
            <button className="pa-send" onClick={() => void send()} disabled={busy}>
              Send
            </button>
          </div>
          <div className="pa-note">Answers are automated and may contain mistakes.</div>
        </div>
      )}
      <button className="pa-fab" onClick={() => setOpen((v) => !v)} aria-label="Ask the press">
        {open ? "Close" : "Ask us"}
      </button>
    </div>
  );
}
