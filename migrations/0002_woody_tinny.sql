-- Woody or Tinny? D1 tables (prefixed wt_ to coexist with existing ZEDF tables)

CREATE TABLE IF NOT EXISTS wt_words (
  id INTEGER PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  algo_label TEXT NOT NULL CHECK (algo_label IN ('WOODY', 'TINNY')),
  score REAL NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  borderline_seq INTEGER,
  woody_votes INTEGER NOT NULL DEFAULT 0,
  tinny_votes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_wt_words_borderline_seq
  ON wt_words (borderline_seq)
  WHERE borderline_seq IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wt_words_unvoted
  ON wt_words (id)
  WHERE woody_votes = 0 AND tinny_votes = 0;

CREATE TABLE IF NOT EXISTS wt_votes (
  word_id INTEGER NOT NULL,
  voter_hash TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('WOODY', 'TINNY')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (word_id, voter_hash),
  FOREIGN KEY (word_id) REFERENCES wt_words(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wt_votes_voter
  ON wt_votes (voter_hash);

CREATE TABLE IF NOT EXISTS wt_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL DEFAULT 0,
  woody INTEGER NOT NULL DEFAULT 0,
  tinny INTEGER NOT NULL DEFAULT 0,
  borderline_total INTEGER NOT NULL DEFAULT 0,
  borderline_voted INTEGER NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  words_voted INTEGER NOT NULL DEFAULT 0
);
