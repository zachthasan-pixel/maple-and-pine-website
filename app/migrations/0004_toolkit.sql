-- Author Toolkit support (additive).
ALTER TABLE manuscript_submissions ADD COLUMN ref TEXT;
ALTER TABLE manuscript_submissions ADD COLUMN status TEXT DEFAULT 'received';

CREATE TABLE IF NOT EXISTS daily_counters (
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name)
);
