-- Replace placeholder Vtuber names + avatars with the real ones.
-- Run AFTER you have:
--   1. Real names for each RL-01 .. RL-15 slot
--   2. Avatar images uploaded to Supabase Storage (or any public CDN)
--      and their public URLs ready
--
-- Edit each row below, save as `replace_vtubers.sql`, and run in SQL Editor.
-- The id column is the stable key — name and avatar_url are what change.

UPDATE vtubers SET name = '真實名字 1', avatar_url = 'https://your.cdn/path/01.png' WHERE id = 1;
UPDATE vtubers SET name = '真實名字 2', avatar_url = 'https://your.cdn/path/02.png' WHERE id = 2;
UPDATE vtubers SET name = '真實名字 3', avatar_url = 'https://your.cdn/path/03.png' WHERE id = 3;
UPDATE vtubers SET name = '真實名字 4', avatar_url = 'https://your.cdn/path/04.png' WHERE id = 4;
UPDATE vtubers SET name = '真實名字 5', avatar_url = 'https://your.cdn/path/05.png' WHERE id = 5;
UPDATE vtubers SET name = '真實名字 6', avatar_url = 'https://your.cdn/path/06.png' WHERE id = 6;
UPDATE vtubers SET name = '真實名字 7', avatar_url = 'https://your.cdn/path/07.png' WHERE id = 7;
UPDATE vtubers SET name = '真實名字 8', avatar_url = 'https://your.cdn/path/08.png' WHERE id = 8;
UPDATE vtubers SET name = '真實名字 9', avatar_url = 'https://your.cdn/path/09.png' WHERE id = 9;
UPDATE vtubers SET name = '真實名字 10', avatar_url = 'https://your.cdn/path/10.png' WHERE id = 10;
UPDATE vtubers SET name = '真實名字 11', avatar_url = 'https://your.cdn/path/11.png' WHERE id = 11;
UPDATE vtubers SET name = '真實名字 12', avatar_url = 'https://your.cdn/path/12.png' WHERE id = 12;
UPDATE vtubers SET name = '真實名字 13', avatar_url = 'https://your.cdn/path/13.png' WHERE id = 13;
UPDATE vtubers SET name = '真實名字 14', avatar_url = 'https://your.cdn/path/14.png' WHERE id = 14;
UPDATE vtubers SET name = '真實名字 15', avatar_url = 'https://your.cdn/path/15.png' WHERE id = 15;

-- Sanity check after running:
--   SELECT id, code, name, avatar_url FROM vtubers ORDER BY id;
