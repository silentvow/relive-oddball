-- ReLive Oddball — Supabase setup
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Idempotent: safe to re-run.

------------------------------------------------------------
-- 1. Tables
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vtubers (
  id            INTEGER PRIMARY KEY,           -- 1..15, stable across deploys
  code          TEXT    NOT NULL,              -- "RL-01" .. "RL-15"
  name          TEXT    NOT NULL,              -- display name (defaults to code; replaced before launch)
  avatar_url    TEXT,                          -- public URL or NULL while still using SVG placeholder
  bg_color      TEXT    NOT NULL,              -- hex incl. "#" — for the placeholder fallback
  fg_color      TEXT    NOT NULL,              -- hex incl. "#" — text color on placeholder
  display_order INTEGER NOT NULL               -- initial order in the candidate pool
);

CREATE TABLE IF NOT EXISTS submissions (
  user_uuid   UUID        PRIMARY KEY,         -- generated client-side and stored in localStorage
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rankings (
  user_uuid   UUID    NOT NULL REFERENCES submissions(user_uuid) ON DELETE CASCADE,
  vtuber_id   INTEGER NOT NULL REFERENCES vtubers(id),
  rank        INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 15),
  PRIMARY KEY (user_uuid, vtuber_id)
);

-- Each user must rank every Vtuber exactly once.
-- Enforced by PRIMARY KEY (user_uuid, vtuber_id) plus the upsert routine in the Server Action,
-- which deletes any old rankings for the user before inserting the new 15.

CREATE INDEX IF NOT EXISTS idx_rankings_vtuber ON rankings(vtuber_id);
CREATE INDEX IF NOT EXISTS idx_rankings_rank   ON rankings(vtuber_id, rank);

------------------------------------------------------------
-- 2. Aggregate views
------------------------------------------------------------

-- Main leaderboard. Lower avg_rank = considered weirder.
-- Bayesian smoothed avg uses C=10, prior=8 (neutral middle).
-- LEFT JOIN keeps Vtubers with zero votes visible during early days.
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  v.id,
  v.code,
  v.name,
  v.avatar_url,
  v.bg_color,
  v.fg_color,
  COALESCE(AVG(r.rank), 8.0)::numeric(4,2)                                     AS avg_rank,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.rank), 8.0)::numeric(4,2) AS median_rank,
  COUNT(r.user_uuid)                                                           AS vote_count,
  ((10 * 8.0 + COALESCE(SUM(r.rank), 0))::numeric / (10 + COUNT(r.user_uuid)))::numeric(4,2) AS bayes_rank
FROM vtubers v
LEFT JOIN rankings r ON r.vtuber_id = v.id
GROUP BY v.id, v.code, v.name, v.avatar_url, v.bg_color, v.fg_color;

-- Heatmap source: how many votes each Vtuber got at each rank position 1..15.
CREATE OR REPLACE VIEW rank_distribution AS
SELECT
  v.id    AS vtuber_id,
  r.rank  AS rank,
  COUNT(*) AS vote_count
FROM vtubers v
JOIN rankings r ON r.vtuber_id = v.id
GROUP BY v.id, r.rank;

-- "已有 N 人投票"
CREATE OR REPLACE VIEW submissions_count AS
SELECT COUNT(*)::INTEGER AS total FROM submissions;

------------------------------------------------------------
-- 3. Row Level Security
------------------------------------------------------------
-- Strategy: anon role can SELECT public stuff. All writes go through Server
-- Actions using the service_role key (which bypasses RLS). This keeps the
-- public surface read-only and prevents script-kiddie writes.

ALTER TABLE vtubers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vtubers_select     ON vtubers;
DROP POLICY IF EXISTS submissions_select ON submissions;
DROP POLICY IF EXISTS rankings_select    ON rankings;

CREATE POLICY vtubers_select     ON vtubers     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY submissions_select ON submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY rankings_select    ON rankings    FOR SELECT TO anon, authenticated USING (true);

-- Views inherit policies of their underlying tables; the service_role used by
-- Server Actions bypasses RLS, so reads/writes from the server work regardless.

------------------------------------------------------------
-- 4. Seed: 15 placeholder Vtubers
------------------------------------------------------------
-- Run on a fresh DB. Uses ON CONFLICT so re-running won't duplicate.
-- Replace name + avatar_url before launch using replace_vtubers.example.sql.

INSERT INTO vtubers (id, code, name, avatar_url, bg_color, fg_color, display_order) VALUES
  ( 1, 'RL-01', 'RL-01', NULL, '#B8D4C4', '#2D4A3A',  1),
  ( 2, 'RL-02', 'RL-02', NULL, '#D9B8C0', '#4A1828',  2),
  ( 3, 'RL-03', 'RL-03', NULL, '#DDC987', '#5A4A1F',  3),
  ( 4, 'RL-04', 'RL-04', NULL, '#D49A8C', '#4A1B0C',  4),
  ( 5, 'RL-05', 'RL-05', NULL, '#C2B5D2', '#3F2E5A',  5),
  ( 6, 'RL-06', 'RL-06', NULL, '#B5C5D2', '#2D4055',  6),
  ( 7, 'RL-07', 'RL-07', NULL, '#D9BFA8', '#5A3A1F',  7),
  ( 8, 'RL-08', 'RL-08', NULL, '#C5D4A8', '#2A4A0F',  8),
  ( 9, 'RL-09', 'RL-09', NULL, '#D4A8B5', '#4A1828',  9),
  (10, 'RL-10', 'RL-10', NULL, '#DDD0A8', '#5A4A1F', 10),
  (11, 'RL-11', 'RL-11', NULL, '#B5C8B0', '#2A4A2A', 11),
  (12, 'RL-12', 'RL-12', NULL, '#C2A5C0', '#3F1F4A', 12),
  (13, 'RL-13', 'RL-13', NULL, '#D4CA98', '#5A4A1F', 13),
  (14, 'RL-14', 'RL-14', NULL, '#D4B098', '#5A2F1F', 14),
  (15, 'RL-15', 'RL-15', NULL, '#B8CAD4', '#1F3A4A', 15)
ON CONFLICT (id) DO NOTHING;

------------------------------------------------------------
-- 5. Sanity check
------------------------------------------------------------
-- Run these manually after setup to confirm everything works:
--   SELECT count(*) FROM vtubers;          -- expect 15
--   SELECT * FROM leaderboard ORDER BY id; -- expect 15 rows, vote_count=0 each, avg_rank=8.00
--   SELECT * FROM submissions_count;       -- expect total=0
