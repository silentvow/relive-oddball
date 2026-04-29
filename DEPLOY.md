# 部署到 Vercel

照這份做一次就上線了。預計 15~20 分鐘。

## 前置確認

跑下面這個本機完整 build，確認沒有 TypeScript / lint 錯誤再開始：

```bash
npm install   # 先確保所有套件都裝好
npm run build
```

最後一行應該看到 `✓ Compiled successfully` 與每條 route 的列表。如果失敗，先把錯誤修掉再繼續。

## 1. 把專案推到 GitHub

```bash
cd C:\Users\User\repos\relive-oddball

# 第一次的話：
git init
git add .
git commit -m "Initial commit: ReLive Oddball MVP"

# 在 https://github.com/new 建一個新 repo（不要勾 README / .gitignore，空的就好）
# 接著把 origin 設定到那個 repo（GitHub 會給你指令）：
git remote add origin git@github.com:你的名字/relive-oddball.git
git branch -M main
git push -u origin main
```

`.env.local` 已被 `.gitignore` 排除，金鑰不會上 GitHub。

## 2. 匯入到 Vercel

1. 去 https://vercel.com，用 GitHub 帳號登入
2. 點右上 **Add New → Project**
3. 找到剛剛的 `relive-oddball` repo，按 **Import**
4. **Framework Preset** 應該自動偵測為 Next.js（沒偵測到就手動選）
5. **Root Directory**: `./`（保留預設）
6. 在 **Environment Variables** 區塊填入 3 個：

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | 你 Supabase 專案的 URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key（保密！） |

   值跟 `.env.local` 裡填的一樣。

7. 按 **Deploy**

第一次 build 約 1~2 分鐘。完成後會跳到綠色 **🎉 Congratulations** 畫面，網址通常是 `relive-oddball-{隨機碼}.vercel.app`。

## 3. 設定固定網址 `relive-oddball.vercel.app`

Vercel 預設會給你帶亂碼的 subdomain。要用 `relive-oddball.vercel.app`：

1. 部署完成後，左側 sidebar **Settings → Domains**
2. 在 **Add Domain** 輸入 `relive-oddball.vercel.app`
3. 如果這名字沒人用過，Vercel 會直接綁上去
4. 如果被佔用了，挑一個 `relive-oddball-X.vercel.app` 變體即可，或之後再買真實網域

## 4. 上線後驗證

打開你的正式 URL，逐項測：

- [ ] 首頁載入：標題、軸帶、候選池、空格 1-15、disabled 送出列
- [ ] favicon：browser tab 看到米色 RL 小圖
- [ ] 拖曳：拉一個進空格 → 互換 → 重複 → 全部 15 → 送出
- [ ] 跳轉到 `/results?u={uuid}` 成功
- [ ] 結果頁顯示我的排名 + 全站排行榜 + 熱力圖
- [ ] 下載圖片：得到一張 PNG
- [ ] 複製連結：剪貼簿真的有東西
- [ ] 開分享連結：`/share/{uuid}` 載入正確
- [ ] OG 圖卡：在 Twitter / Threads 等社群貼網址，預覽會出現 1200×630 圖卡（含前 3 名）
  - Twitter card validator: https://cards-dev.twitter.com/validator
  - Facebook debugger: https://developers.facebook.com/tools/debug/
- [ ] 404 頁：手打 `/share/not-real-uuid` 看到友善 404
- [ ] 真機跑一遍：iPhone Safari、Android Chrome 都試一次

## 5. Supabase production 設定

開發跟 production 通常用**同一個 Supabase 專案**就好（流量小不用分），所以資料庫不用再做事。

如果之後想分開（專門開發測試用一個、正式上線用另一個）：

1. 再建一個 Supabase 專案
2. 複製 `supabase/setup.sql` 到新專案的 SQL Editor 跑一次
3. 把那個專案的 URL / keys 設到 Vercel 環境變數
4. 本地 `.env.local` 仍用舊（dev）那組

## 6. 替換真實 Vtuber 名單

當你拿到 ReLive Project 的真實名稱跟頭貼圖：

1. 把頭貼圖上傳到 **Supabase Storage**：
   - Supabase dashboard → Storage → New bucket → 名稱 `avatars` → **Public**
   - 上傳 15 張圖（檔名隨意，例如 `01.png`、`02.png` ...）
   - 點任一檔案 → 右側 **Get URL**，會得到 `https://xxx.supabase.co/storage/v1/object/public/avatars/01.png` 形式的 URL
2. 編輯 `supabase/replace_vtubers.example.sql`：
   - 把 `'真實名字 N'` 換成實際名稱
   - 把 `'https://your.cdn/path/0N.png'` 換成 Storage URL
3. 在 Supabase SQL Editor 跑這份檔案
4. 等 60 秒（首頁 cache）或重新整理頁面，就會看到真實素材

> 因為 `next.config.js` 的 `images.remotePatterns` 已經允許 `**.supabase.co`，所以圖片直接跑得起來。

## 7. 自訂網域（可選）

要用自己的網域（例如 `relive-oddball.com`）：

1. 買網域（Namecheap / Cloudflare 都行）
2. Vercel **Settings → Domains → Add** 你的網域
3. 照 Vercel 給的指示在 DNS 服務商加 CNAME 或 A record
4. SSL 憑證 Vercel 會自動幫你申請 Let's Encrypt（幾分鐘內生效）

記得更新 `app/robots.ts` 裡的 sitemap URL 跟 `app/share/[uuid]/page.tsx` 等地方提到的網域。

## 後續維運

- **看流量**：Vercel dashboard → Analytics 頁籤
- **看效能**：Vercel dashboard → Speed Insights 頁籤
- **看資料**：Supabase dashboard → Table Editor 看 `submissions` 跟 `rankings` 表
- **更新程式碼**：`git push` 到 main，Vercel 會自動重新 build & deploy
- **rollback**：Vercel → Deployments → 找之前那個 → ⋯ → **Promote to Production**
