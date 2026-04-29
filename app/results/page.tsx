import Link from "next/link";

import { AxisBar } from "@/components/AxisBar";
import {
  fetchHeatmap,
  fetchLeaderboard,
  fetchMyRanking,
  fetchSubmissionCount,
  fetchVtubers,
} from "@/lib/data";
import type { Vtuber } from "@/lib/vtubers";

import { Heatmap } from "./Heatmap";
import { LeaderboardCard } from "./LeaderboardCard";
import { MyRankingCard } from "./MyRankingCard";
import { ShareBar } from "./ShareBar";
import { UuidRedirect } from "./UuidRedirect";

// Refresh leaderboard / heatmap every minute. Each submission also forcibly
// revalidates this path (see app/actions.ts).
export const revalidate = 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchParams = { u?: string };

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const u =
    searchParams?.u && UUID_RE.test(searchParams.u) ? searchParams.u : null;

  const [vtubers, leaderboard, heatmap, count, myRanking] = await Promise.all([
    fetchVtubers(),
    fetchLeaderboard(),
    fetchHeatmap(),
    fetchSubmissionCount(),
    u ? fetchMyRanking(u) : Promise.resolve(null),
  ]);

  const byId: Record<number, Vtuber> = Object.fromEntries(
    vtubers.map((v) => [v.id, v]),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      {!u && <UuidRedirect />}

      <header className="mb-6 text-center">
        <h1 className="text-2xl font-medium md:text-3xl">
          {myRanking ? "謝謝你的勇敢發言！" : "全站排行榜"}
        </h1>
        <p className="mt-1 text-sm text-ink-mute">
          已有 {count.toLocaleString()} 人投票
        </p>
      </header>

      <div className="mb-4">
        <AxisBar />
      </div>

      {/* My ranking + Leaderboard. On desktop side-by-side, on mobile stacked. */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {myRanking ? (
          <MyRankingCard ranking={myRanking} byId={byId} />
        ) : (
          <NoRankingPrompt />
        )}
        <LeaderboardCard rows={leaderboard} />
      </div>

      <div className="mb-6">
        <Heatmap matrix={heatmap} rowOrder={leaderboard} />
      </div>

      {myRanking && u && (
        <div className="mb-6">
          <ShareBar uuid={u} ranking={myRanking} byId={byId} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-full border-2 border-ink bg-rank-cold px-4 py-1.5 text-xs font-medium text-[#2D4A3A] hover:bg-rank-cool"
        >
          {myRanking ? "重新排名" : "去投我的一票 →"}
        </Link>
      </div>

      <footer className="mt-10 text-center text-[11px] text-ink-ghost">
        relive-oddball.vercel.app
      </footer>
    </main>
  );
}

function NoRankingPrompt() {
  return (
    <section className="rounded-card border-[1.5px] border-dashed border-edge-soft bg-cream-card px-4 py-6 text-center">
      <h2 className="text-xs font-medium text-ink-mute">我的排名</h2>
      <p className="mt-2 text-xs text-ink-ghost">
        你還沒投過喔。點下方按鈕去拖出你的排名 →
      </p>
    </section>
  );
}
