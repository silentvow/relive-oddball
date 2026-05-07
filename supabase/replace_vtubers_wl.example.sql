-- Replace placeholder names + avatars for the wang-low (7-Vtuber) ranking.
-- Run AFTER you have:
--   1. Real names for each WL-1 .. WL-7 slot
--   2. Avatar images uploaded to Supabase Storage (or any public CDN)
--      and their public URLs ready
--
-- Edit each row below, save as `replace_vtubers_wl.sql`, and run in SQL Editor.
-- The id column is the stable key — name and avatar_url are what change.

UPDATE vtubers_wl SET name = '濛瀧 Taki', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/taki.jpg' WHERE id = 1;
UPDATE vtubers_wl SET name = '梅迪歐 Meteor', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/meteor.jpg' WHERE id = 2;
UPDATE vtubers_wl SET name = '咲鼠 Sparky', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/sparky.jpg' WHERE id = 3;
UPDATE vtubers_wl SET name = '神崎アルファ Alpha', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/alpha.jpg' WHERE id = 4;
UPDATE vtubers_wl SET name = '尼皮 NiPi', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/nipi.jpg' WHERE id = 5;
UPDATE vtubers_wl SET name = '海色水晶 Kristal', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/kristal.jpg' WHERE id = 6;
UPDATE vtubers_wl SET name = '亞彌奈 Ayana', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/ayana.jpg' WHERE id = 7;

-- Sanity check after running:
--   SELECT id, code, name, avatar_url FROM vtubers_wl ORDER BY id;
