-- Wang-Low (海亞！法克你又望樓怪咖排名) — 7-Vtuber ranking
-- Independent of the main 15-Vtuber tables. Run this once in Supabase SQL Editor.
-- Idempotent: safe to re-run.
--
-- Why separate tables? Per Peter's spec, the wang-low scoring is FULLY ISOLATED
-- from the main 15-Vtuber ranking, even if the same person/character appears
-- in both. Cleanest way to guarantee that is to give each ranking its own
-- universe of tables.

------------------------------------------------------------
-- 1. Tables
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vtubers_wl (
  id            INTEGER PRIMARY KEY,           -- 1..7, stable across deploys
  code          TEXT    NOT NULL,              -- "WL-1" .. "WL-7"
  name          TEXT    NOT NULL,
  avatar_url    TEXT,
  bg_color      TEXT    NOT NULL,
  fg_color      TEXT    NOT NULL,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions_wl (
  user_uuid   UUID        PRIMARY KEY,         -- same UUID as main table is fine; rankings stay isolated
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rankings_wl (
  user_uuid   UUID    NOT NULL REFERENCES submissions_wl(user_uuid) ON DELETE CASCADE,
  vtuber_id   INTEGER NOT NULL REFERENCES vtubers_wl(id),
  rank        INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 7),
  PRIMARY KEY (user_uuid, vtuber_id)
);

CREATE INDEX IF NOT EXISTS idx_rankings_wl_vtuber ON rankings_wl(vtuber_id);
CREATE INDEX IF NOT EXISTS idx_rankings_wl_rank   ON rankings_wl(vtuber_id, rank);

------------------------------------------------------------
-- 2. Aggregate views
------------------------------------------------------------
-- Bayesian smoothing for 7-slot ranking: C=10, prior=4 (1..7 midpoint).

CREATE OR REPLACE VIEW leaderboard_wl AS
SELECT
  v.id,
  v.code,
  v.name,
  v.avatar_url,
  v.bg_color,
  v.fg_color,
  COALESCE(AVG(r.rank), 4.0)::numeric(4,2)                                      AS avg_rank,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.rank), 4.0)::numeric(4,2) AS median_rank,
  COUNT(r.user_uuid)                                                            AS vote_count,
  ((10 * 4.0 + COALESCE(SUM(r.rank), 0))::numeric / (10 + COUNT(r.user_uuid)))::numeric(4,2) AS bayes_rank
FROM vtubers_wl v
LEFT JOIN rankings_wl r ON r.vtuber_id = v.id
GROUP BY v.id, v.code, v.name, v.avatar_url, v.bg_color, v.fg_color;

CREATE OR REPLACE VIEW rank_distribution_wl AS
SELECT
  v.id    AS vtuber_id,
  r.rank  AS rank,
  COUNT(*) AS vote_count
FROM vtubers_wl v
JOIN rankings_wl r ON r.vtuber_id = v.id
GROUP BY v.id, r.rank;

CREATE OR REPLACE VIEW submissions_count_wl AS
SELECT COUNT(*)::INTEGER AS total FROM submissions_wl;

------------------------------------------------------------
-- 3. Row Level Security
------------------------------------------------------------

ALTER TABLE vtubers_wl     ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions_wl ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings_wl    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vtubers_wl_select     ON vtubers_wl;
DROP POLICY IF EXISTS submissions_wl_select ON submissions_wl;
DROP POLICY IF EXISTS rankings_wl_select    ON rankings_wl;

CREATE POLICY vtubers_wl_select     ON vtubers_wl     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY submissions_wl_select ON submissions_wl FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY rankings_wl_select    ON rankings_wl    FOR SELECT TO anon, authenticated USING (true);

------------------------------------------------------------
-- 4. Seed: 7 placeholder Vtubers
------------------------------------------------------------
-- Reuses the muted (Morandi) palette so the look matches the main page.
-- Replace name + avatar_url with real data before launch using
-- replace_vtubers_wl.example.sql.

INSERT INTO vtubers_wl (id, code, name, avatar_url, bg_color, fg_color, display_order) VALUES
  (1, 'WL-1', 'WL-1', NULL, '#D49A8C', '#4A1B0C', 1),
  (2, 'WL-2', 'WL-2', NULL, '#C2A5C0', '#3F1F4A', 2),
  (3, 'WL-3', 'WL-3', NULL, '#C5D4A8', '#2A4A0F', 3),
  (4, 'WL-4', 'WL-4', NULL, '#B8CAD4', '#1F3A4A', 4),
  (5, 'WL-5', 'WL-5', NULL, '#D9B8C0', '#4A1828', 5),
  (6, 'WL-6', 'WL-6', NULL, '#DDC987', '#5A4A1F', 6),
  (7, 'WL-7', 'WL-7', NULL, '#B8D4C4', '#2D4A3A', 7)
ON CONFLICT (id) DO NOTHING;

------------------------------------------------------------
-- 5. Sanity check
------------------------------------------------------------
--   SELECT count(*) FROM vtubers_wl;            -- expect 7
--   SELECT * FROM leaderboard_wl ORDER BY id;   -- 7 rows, vote_count=0, avg_rank=4.00
--   SELECT total FROM submissions_count_wl;     -- expect 0
