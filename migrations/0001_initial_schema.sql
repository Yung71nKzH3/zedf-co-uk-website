-- Cloudflare D1 Migration for ZEDF
-- Tables: profiles, daily_challenges, leaderboard_scores, gaben_global_stats

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  date TEXT PRIMARY KEY,
  starting_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  display_name TEXT NOT NULL,
  solved INTEGER DEFAULT 1,
  tag_locked INTEGER DEFAULT 1,
  operations INTEGER NOT NULL,
  diversity_score INTEGER NOT NULL,
  result REAL NOT NULL,
  history TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_date_score 
ON leaderboard_scores (date, solved, diversity_score DESC, operations ASC);

CREATE TABLE IF NOT EXISTS gaben_global_stats (
  id TEXT PRIMARY KEY,
  total_seconds INTEGER DEFAULT 0,
  wallets_sacrificed INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial row for gaben_global_stats
INSERT OR IGNORE INTO gaben_global_stats (id, total_seconds, wallets_sacrificed) 
VALUES ('global', 0, 0);
