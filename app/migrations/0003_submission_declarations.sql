-- Additive columns for KDP-style submission declarations.
ALTER TABLE manuscript_submissions ADD COLUMN ai_disclosure TEXT;
ALTER TABLE manuscript_submissions ADD COLUMN rights_confirmed INTEGER;
ALTER TABLE manuscript_submissions ADD COLUMN prior_publication TEXT;
