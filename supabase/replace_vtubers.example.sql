-- Replace placeholder Vtuber names + avatars with the real ones.
-- Run AFTER you have:
--   1. Real names for each RL-01 .. RL-15 slot
--   2. Avatar images uploaded to Supabase Storage (or any public CDN)
--      and their public URLs ready
--
-- Edit each row below, save as `replace_vtubers.sql`, and run in SQL Editor.
-- The id column is the stable key — name and avatar_url are what change.

UPDATE vtubers SET name = '灰妲 DaDa', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/dada.jpg' WHERE id = 1;
UPDATE vtubers SET name = '諾櫻 Noe', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/noe.jpg' WHERE id = 2;
UPDATE vtubers SET name = '梓凜 Tsulin', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/tsulin.jpg' WHERE id = 3;
UPDATE vtubers SET name = '薇妮 Winnie', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/winnie.jpg' WHERE id = 4;
UPDATE vtubers SET name = '燎漓 Loli', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/loli.jpg' WHERE id = 5;
UPDATE vtubers SET name = '咪姆 MeeMu', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/meemu.jpg' WHERE id = 6;
UPDATE vtubers SET name = '冰煉 BANG', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/bang.jpg' WHERE id = 7;
UPDATE vtubers SET name = '魯波 LUPO', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/lupo.jpg' WHERE id = 8;
UPDATE vtubers SET name = '舒狐 Sofox', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/sofox.jpg' WHERE id = 9;
UPDATE vtubers SET name = '空条千子 Senko', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/senko.jpg' WHERE id = 10;
UPDATE vtubers SET name = '十六月 OctJun', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/octjun.jpg' WHERE id = 11;
UPDATE vtubers SET name = '濛瀧 Taki', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/taki.jpg' WHERE id = 12;
UPDATE vtubers SET name = '梅迪歐 Meteor', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/meteor.jpg' WHERE id = 13;
UPDATE vtubers SET name = '咲鼠 Sparky', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/sparky.jpg' WHERE id = 14;
UPDATE vtubers SET name = '比爾比爾 Bill', avatar_url = 'https://ytzkmtdxaxcopwtcfswj.supabase.co/storage/v1/object/public/avatar/bill.jpg' WHERE id = 15;

-- Sanity check after running:
--   SELECT id, code, name, avatar_url FROM vtubers ORDER BY id;
