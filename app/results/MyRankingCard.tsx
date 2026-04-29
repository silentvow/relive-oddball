import { Avatar } from "@/components/Avatar";
import type { Vtuber } from "@/lib/vtubers";

type Props = {
  ranking: { vtuberId: number; rank: number }[];
  byId: Record<number, Vtuber>;
};

export function MyRankingCard({ ranking, byId }: Props) {
  // ranking is already sorted by rank ascending. Render as a 2-column flow:
  // 1..8 on the left, 9..15 on the right (CSS columns auto-balance).
  return (
    <section className="rounded-card border-[1.5px] border-edge bg-cream-card px-4 py-4">
      <h2 className="text-sm font-medium text-ink-mute">我的排名</h2>
      <p className="mb-3 text-xs text-ink-ghost">1 = 最奇怪　15 = 最正常</p>
      <ol className="columns-2 gap-4 [&>li]:break-inside-avoid">
        {ranking.map(({ vtuberId, rank }) => {
          const v = byId[vtuberId];
          if (!v) return null;
          return (
            <li
              key={rank}
              className="flex items-center gap-2 py-1 text-base text-ink"
            >
              <span className="w-6 text-right text-sm text-ink-ghost">
                {rank}
              </span>
              <Avatar vtuber={v} size={40} />
              <span className="flex-1 min-w-0 whitespace-pre-wrap">
                {v.name.replace(" ", "\n")}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
