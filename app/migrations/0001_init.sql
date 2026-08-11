-- D1 schema. Applied by the platform on deploy (only when app.manifest.json
-- sets "db": true). ONE database is shared by preview + prod — keep every
-- change additive (CREATE TABLE IF NOT EXISTS / ADD COLUMN); a destructive
-- change hits production data. Bound as env.DB (see src/lib/bindings.server.ts).
--
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS manuscript_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  pitch TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
