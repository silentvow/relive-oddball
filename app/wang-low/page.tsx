import Link from "next/link";

import { AxisBar } from "@/components/AxisBar";
import { fetchSubmissionCountWL, fetchVtubersWL } from "@/lib/dataWL";
import { RankingBoard } from "@/app/wang-low/ranking/RankingBoard";

export const revalidate = 60;

export default async function WangLowHome() {
  const [vtubers, submissionCount] = await Promise.all([
    fetchVtubersWL(),
    fetchSubmissionCountWL(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-medium md:text-3xl">
          海亞！法克你又望樓怪咖排名
        </h1>
        <p className="mt-1 text-sm text-ink-mute">奇怪沒有對錯，就是你的感覺</p>
      </header>

      <div className="mb-4">
        <AxisBar count={vtubers.length} />
      </div>

      <RankingBoard vtubers={vtubers} submissionCount={submissionCount} />

      <div className="mt-8 text-center text-xs text-ink-mute">
        想排另一組？{" "}
        <Link
          href="/"
          className="underline decoration-edge underline-offset-2 hover:text-ink"
        >
          ← 回到 15 人怪咖排名
        </Link>
      </div>

      <footer className="mt-6 text-center text-[11px] text-ink-ghost">
        Powered by 彼得與狼
      </footer>
    </main>
  );
}
