-- Assistant question log (additive).
CREATE TABLE IF NOT EXISTS assistant_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
