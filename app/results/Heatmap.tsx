import type { Vtuber } from "@/lib/vtubers";

type Props = {
  // matrix[vtuberId-1][rank-1] = vote count
  matrix: number[][];
  // Order to display rows. Usually we follow the leaderboard order so the
  // diagonal pattern emerges visually (most-weird at top, votes peak at low
  // rank columns; least-weird at bottom, votes peak at high rank columns).
  rowOrder: Vtuber[];
};

// 4-shade ramp: faint → light → medium → peak.
// Per-row normalisation by the row's own max — emphasises where each Vtuber's
// votes concentrate, regardless of total vote count differences between rows.
function shadeFor(count: number, rowMax: number): string {
  if (rowMax === 0 || count === 0) return "#ECE2CB"; // faint
  const ratio = count / rowMax;
  if (ratio >= 0.75) return "#8E6F3A"; // peak
  if (ratio >= 0.45) return "#B89366"; // medium
  if (ratio >= 0.2) return "#DCC499"; // light
  return "#ECE2CB"; // faint
}

export function Heatmap({ matrix, rowOrder }: Props) {
  return (
    <section className="rounded-card border-[1.5px] border-edge bg-cream-card px-4 py-3">
      <h2 className="text-xs font-medium text-ink-mute">投票分佈熱力圖</h2>
      <p className="mb-2 text-[10px] text-ink-ghost">
        越深 = 越多人把這位放在那個名次
      </p>

      {/* Column header: 1, 5, 10, 15 markers */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="w-10 text-[10px] text-ink-ghost">名次</span>
        <div className="grid flex-1 grid-cols-[repeat(15,minmax(0,1fr))] gap-[2px] text-[9px] text-ink-ghost">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((r) => (
            <span key={r} className="text-center">
              {r === 1 || r === 5 || r === 10 || r === 15 ? r : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[2px]">
        {rowOrder.map((v) => {
          const row = matrix[v.id - 1] ?? [];
          const rowMax = Math.max(0, ...row);
          return (
            <div key={v.id} className="flex items-center gap-1.5">
              <span className="w-10 truncate text-[10px] text-ink-soft">{v.code}</span>
              <div className="grid flex-1 grid-cols-[repeat(15,minmax(0,1fr))] gap-[2px]">
                {Array.from({ length: 15 }, (_, i) => i).map((rankIdx) => (
                  <div
                    key={rankIdx}
                    className="h-3.5 rounded-sm"
                    style={{ background: shadeFor(row[rankIdx] ?? 0, rowMax) }}
                    title={`${v.code} · 第 ${rankIdx + 1} 名 · ${row[rankIdx] ?? 0} 票`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-ink-ghost">
        <span>少</span>
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#ECE2CB" }} />
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#DCC499" }} />
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#B89366" }} />
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#8E6F3A" }} />
        <span>多</span>
      </div>
    </section>
  );
}
