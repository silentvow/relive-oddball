import { AxisBar } from "@/components/AxisBar";
import { fetchVtubers, fetchSubmissionCount } from "@/lib/data";
import { RankingBoard } from "@/app/ranking/RankingBoard";

// Cache the vtubers + count for 60s. Each submission revalidates /results
// (see app/actions.ts), but the home page numbers can lag a bit safely.
export const revalidate = 60;

export default async function Home() {
  const [vtubers, submissionCount] = await Promise.all([
    fetchVtubers(),
    fetchSubmissionCount(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-medium md:text-3xl">
          李賴虎怪咖排名生成器
        </h1>
        <p className="mt-1 text-sm text-ink-mute">奇怪沒有對錯，就是你的感覺</p>
      </header>

      <div className="mb-4">
        <AxisBar />
      </div>

      <RankingBoard vtubers={vtubers} submissionCount={submissionCount} />

      <footer className="mt-10 text-center text-[11px] text-ink-ghost">
        Powered by 彼得與狼
      </footer>
    </main>
  );
}
