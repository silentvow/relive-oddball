import { Avatar } from "@/components/Avatar";
import type { LeaderboardRow } from "@/lib/data";

type Props = {
  rows: LeaderboardRow[];
};

export function LeaderboardCard({ rows }: Props) {
  return (
    <section className="rounded-card border-[1.5px] border-edge bg-cream-card px-4 py-4">
      <h2 className="text-sm font-medium text-ink-mute">全站排行榜</h2>
      <p className="mb-3 text-xs text-ink-ghost">越上面 = 大家覺得越奇怪</p>
      <ol className="columns-2 gap-4 [&>li]:break-inside-avoid">
        {rows.map((v, idx) => {
          const rank = idx + 1;
          return (
            <li
              key={v.id}
              className="flex items-center gap-2 py-1 text-base text-ink"
            >
              <span className="w-6 text-right text-sm text-ink-ghost">{rank}</span>
              <Avatar vtuber={v} size={40} />
              <span>{v.name}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
