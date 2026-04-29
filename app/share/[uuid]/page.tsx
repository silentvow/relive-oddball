import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar } from "@/components/Avatar";
import { fetchMyRanking, fetchSubmissionCount, fetchVtubers } from "@/lib/data";
import { rankColor, type Vtuber } from "@/lib/vtubers";

export const revalidate = 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Params = { uuid: string };

export async function generateMetadata({ params }: { params: Params }) {
  // OG image is generated at app/share/[uuid]/opengraph-image.tsx and picked
  // up automatically by Next; metadata here just sets title + description.
  return {
    title: "ReLive Oddball — 別人的奇怪度排名",
    description: "看看這個人怎麼排 ReLive Project Vtuber 的奇怪度。",
  };
}

export default async function SharePage({ params }: { params: Params }) {
  if (!UUID_RE.test(params.uuid)) notFound();

  const [vtubers, ranking, count] = await Promise.all([
    fetchVtubers(),
    fetchMyRanking(params.uuid),
    fetchSubmissionCount(),
  ]);
  if (!ranking || ranking.length === 0) notFound();

  const byId: Record<number, Vtuber> = Object.fromEntries(
    vtubers.map((v) => [v.id, v]),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-wider text-ink-ghost">
          ReLive Oddball
        </p>
        <h1 className="mt-1 text-2xl font-medium md:text-3xl">
          這是某人的奇怪度排名
        </h1>
        <p className="mt-1 text-sm text-ink-mute">
          奇怪沒有對錯，就是 ta 的感覺 · 全站已有 {count.toLocaleString()}{" "}
          人投票
        </p>
      </header>

      <ol className="mb-6 grid grid-cols-1 gap-1.5 rounded-card border-[1.5px] border-edge bg-cream-card p-4 sm:grid-cols-2 sm:gap-x-6">
        {ranking.map(({ vtuberId, rank }) => {
          const v = byId[vtuberId];
          if (!v) return null;
          const c = rankColor(rank);
          return (
            <li
              key={rank}
              className="flex items-center gap-2.5 rounded-slot border-[1.5px] bg-cream px-3 py-1.5"
              style={{ borderColor: c.bg }}
            >
              <span
                className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                style={{ background: c.bg, color: c.fg }}
              >
                {rank}
              </span>
              <Avatar vtuber={v} size={26} />
              <span className="text-xs text-ink">{v.name}</span>
              {rank === 1 && (
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ background: c.bg, color: c.fg }}
                >
                  最奇怪
                </span>
              )}
              {rank === 15 && (
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ background: c.bg, color: c.fg }}
                >
                  最正常
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-full border-2 border-ink bg-rank-cold px-4 py-1.5 text-xs font-medium text-[#2D4A3A] hover:bg-rank-cool"
        >
          我也要排我的 →
        </Link>
        <Link
          href="/results"
          className="rounded-full border border-edge-soft bg-cream-card px-3 py-1.5 text-xs text-ink-mute hover:bg-cream-deep"
        >
          看全站排行榜
        </Link>
      </div>

      <footer className="mt-10 text-center text-[11px] text-ink-ghost">
        relive-oddball.vercel.app
      </footer>
    </main>
  );
}
