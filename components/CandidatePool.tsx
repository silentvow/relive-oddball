import { Avatar } from "@/components/Avatar";
import type { Vtuber } from "@/lib/vtubers";

type Props = {
  vtubers: Vtuber[];
  remaining: number;
};

// Static layout of the candidate pool — just renders the avatars in a grid.
// Drag-and-drop wiring (dnd-kit) lands in Phase 3.
export function CandidatePool({ vtubers, remaining }: Props) {
  return (
    <div className="rounded-card border border-dashed border-edge-soft bg-cream-card p-3">
      <p className="mb-2 text-center text-[11px] text-ink-mute">
        候選池 · 還有 {remaining} 位待安排
      </p>
      <div className="grid grid-cols-5 justify-items-center gap-1.5 md:grid-cols-4">
        {vtubers.map((v) => (
          <Avatar key={v.id} vtuber={v} size={42} />
        ))}
      </div>
      <p className="mt-3 rounded-md bg-cream-deep px-2.5 py-1.5 text-center text-[11px] text-ink-mute">
        把頭貼往下拖 ↓
      </p>
    </div>
  );
}
