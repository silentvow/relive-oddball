# Supabase 設定步驟

跟著這份文件做一次，之後就可以接 Phase 3（拖曳互動 + 寫入資料庫）。

## 1. 註冊 / 登入 Supabase

去 https://supabase.com，用 GitHub 登入最快。免費方案 (Free tier) 就夠用：500MB Postgres、無限 API 請求、後台 dashboard 全開。

## 2. 建立新專案

點 **New Project** → 填這幾個欄位：

- **Name**: `relive-oddball`
- **Database Password**: 隨意產生一個強密碼，**存到密碼管理員**（之後用不到，但忘了要重設很煩）
- **Region**: 選 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**，越近越快
- **Pricing Plan**: Free

按 **Create new project**。後台會花 ~1 分鐘 provisioning。

## 3. 拿三組金鑰

專案開好後，左側 sidebar 點齒輪 **Project Settings → API**。會看到：

- **Project URL** — 例如 `https://abcdefg.supabase.co`
- **Project API keys**:
  - **anon / public** — 給瀏覽器用，安全
  - **service_role / secret** — 只給伺服器用，**不可外洩**

打開專案根目錄的 `.env.local.example`，複製成 `.env.local`，把上面三個值填進去：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...（anon key）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...（service_role key）
```

`.env.local` 已經在 `.gitignore` 裡，不會被 commit 到 GitHub。

## 4. 跑 schema

回 Supabase 後台，左側 sidebar 點 **SQL Editor → New query**。

打開專案的 `supabase/setup.sql`，全選複製，貼到 SQL Editor，按右下角 **Run**（或 Ctrl/Cmd + Enter）。

跑完應該看到 `Success. No rows returned`。

## 5. 驗證

還在 SQL Editor，貼以下三個 query 跑跑看：

```sql
SELECT count(*) FROM vtubers;          -- 預期：15
SELECT * FROM leaderboard ORDER BY id; -- 預期：15 列，vote_count = 0，avg_rank = 8.00
SELECT total FROM submissions_count;   -- 預期：0
```

也可以左側 sidebar 點 **Table Editor**，能看到 `vtubers` / `submissions` / `rankings` 三張表。

## 6. 重啟 dev server

回終端機按 `Ctrl+C` 停掉 `npm run dev`，再跑一次 `npm run dev`，這樣才會讀到新的 `.env.local`。

頁面看起來目前還是不會變（前端還沒接 Supabase），下一步 Phase 3 才會。

---

## 之後：替換真實 Vtuber 名單

當你拿到 ReLive Project 的真實名字 + 頭貼 URL（建議圖檔上傳到 Supabase Storage 取得 public URL）：

1. 複製 `supabase/replace_vtubers.example.sql` 為 `replace_vtubers.sql`
2. 編輯每一列，把 `'真實名字 N'` 換成實際名稱、`'https://your.cdn/path/0N.png'` 換成 avatar URL
3. 在 SQL Editor 跑這份檔案
4. 重新整理網頁就會看到實際資料

## 疑難排解

**`relation "vtubers" already exists`**
你可能跑過一次了。setup.sql 是 idempotent 的，再按 Run 也安全（會跳過已存在的物件）。

**`.env.local 改了但畫面沒變`**
重啟 `npm run dev`。Next.js 不會 hot-reload 環境變數。

**Tokyo / Singapore 都沒得選**
免費方案有時某些 region 滿載，挑 Mumbai 或 Sydney 也還行。

**忘了 service_role key 長怎樣**
回 Project Settings → API → 旁邊有「Reveal」眼睛圖示。
