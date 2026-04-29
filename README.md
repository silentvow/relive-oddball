# ReLive Oddball

> 拖出你心目中的 ReLive Project Vtuber 奇怪度排名。
> 奇怪沒有對錯，就是你的感覺。

**Stack**: Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · dnd-kit · html-to-image
**Deploy target**: `relive-oddball.vercel.app`

## 開發

```bash
npm install
cp .env.local.example .env.local   # 填入 Supabase 金鑰
npm run dev
```

開啟 http://localhost:3000 。

第一次跑之前要先把 Supabase 設好，照 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) 走一次。

## 上線

照 [`DEPLOY.md`](./DEPLOY.md) — 推到 GitHub、匯到 Vercel、設環境變數、按 Deploy。

## 目錄結構

```
app/
├─ layout.tsx                字型 + metadata + Toaster + Analytics
├─ page.tsx                  首頁：async server component fetch vtubers
├─ loading.tsx               首頁骨架屏
├─ not-found.tsx             404 頁
├─ icon.tsx                  動態 favicon
├─ robots.ts                 搜尋引擎指示
├─ globals.css               Tailwind + keyframes + focus-visible 樣式
├─ actions.ts                Server Actions (submitRanking)
├─ ranking/
│  └─ RankingBoard.tsx       客戶端：dnd-kit 排序盤
├─ results/
│  ├─ page.tsx               結果頁：我的 + 全站 + 熱力圖 + 分享
│  ├─ loading.tsx            結果頁骨架屏
│  ├─ MyRankingCard.tsx      我的排名卡（雙欄）
│  ├─ LeaderboardCard.tsx    全站排行榜卡（雙欄）
│  ├─ Heatmap.tsx            15×15 投票分佈圖
│  ├─ ShareBar.tsx           下載 / 分享 / 複製連結
│  ├─ ShareCard.tsx          截圖目標
│  └─ UuidRedirect.tsx       缺 ?u= 時從 localStorage 補
└─ share/
   └─ [uuid]/
      ├─ page.tsx            唯讀分享頁
      ├─ loading.tsx         分享頁骨架屏
      └─ opengraph-image.tsx 動態 OG 圖（前 3 名 + Noto Sans TC）

components/
├─ Avatar.tsx                SVG placeholder + img fallback
├─ AxisBar.tsx               "1 = 最奇怪 → 15 = 最不奇怪"
└─ Toaster.tsx               自製 toast 系統 (70 行)

lib/
├─ vtubers.ts                Vtuber 型別 + rankColor() helper
├─ data.ts                   server-only Supabase 查詢
├─ supabase.ts               browser / server client
├─ userId.ts                 localStorage UUID
└─ storage.ts                localStorage 草稿存取

supabase/
├─ setup.sql                 schema + RLS + view + seed
└─ replace_vtubers.example.sql  上線前替換真實名單的模板
```

## 計分方法

**主要指標：平均排名 (Average Rank)** — 把每個 Vtuber 在所有用戶那的排名數字平均起來，越小越奇怪。

**輔助指標**：
- 中位數排名（抗極端值）
- Bayesian smoothed avg（C=10, prior=8） — 投票數少時用這個排，避免單一票把人釘在第一名
- 投票分佈熱力圖 — 看每位 Vtuber 的得票位置集中還是分散

詳見 [`vtuber-ranking-plan.md`](../vtuber-ranking-plan.md) 第四節。

## 替換真實 Vtuber 名單

`supabase/setup.sql` 種了 `RL-01` ~ `RL-15` 佔位資料。當你拿到真實名稱跟頭貼：

1. 把頭貼圖上傳到 Supabase Storage（建立 public bucket）
2. 編輯 `supabase/replace_vtubers.example.sql`，填入真名 + Storage URL
3. 在 Supabase SQL Editor 跑這份檔案

詳細流程在 [`DEPLOY.md`](./DEPLOY.md#6-替換真實-vtuber-名單)。
