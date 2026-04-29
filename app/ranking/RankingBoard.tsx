"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Avatar } from "@/components/Avatar";
import { rankColor, type Vtuber } from "@/lib/vtubers";
import { getOrCreateUserId } from "@/lib/userId";
import {
  clearDraft,
  loadDraft,
  markSubmitted,
  saveDraft,
  type DraftState,
} from "@/lib/storage";
import { submitRanking } from "@/app/actions";
import { toast } from "@/components/Toaster";

type Props = {
  vtubers: Vtuber[];
  submissionCount: number;
};

const POOL_ID = "pool";
const slotId = (rank: number) => `slot-${rank}`;
const itemId = (vtuberId: number) => `v-${vtuberId}`;
const parseItemId = (id: string) => parseInt(id.slice(2), 10);
const parseSlotId = (id: string) => parseInt(id.slice(5), 10);

function freshState(vtubers: Vtuber[]): DraftState {
  return {
    pool: [...vtubers].sort((a, b) => a.displayOrder - b.displayOrder).map((v) => v.id),
    slots: Array(15).fill(null),
  };
}

// Custom collision detection. When the pointer is directly over a droppable
// (e.g. the rank pill or empty placeholder span inside a slot row), use that —
// avoids "drop slips to a neighboring slot" caused by closestCenter picking
// whichever slot's center is closer to the dragged item's center. Only fall
// back to rect/center when the pointer is in a gap between elements.
const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  const rect = rectIntersection(args);
  if (rect.length > 0) return rect;
  return closestCenter(args);
};

export function RankingBoard({ vtubers, submissionCount }: Props) {
  const byId = useMemo(
    () => Object.fromEntries(vtubers.map((v) => [v.id, v])) as Record<number, Vtuber>,
    [vtubers],
  );

  // Hydration-safe init: start with the deterministic fresh state on the
  // server render, then swap in the localStorage draft (if any) on mount.
  const [state, setState] = useState<DraftState>(() => freshState(vtubers));
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setState(draft);
  }, []);

  // Persist on every change (after the first hydration tick).
  const isFresh = state.slots.every((s) => s === null);
  useEffect(() => {
    if (!isFresh) saveDraft(state);
  }, [state, isFresh]);

  const remaining = state.pool.length;
  const isComplete = state.slots.every((s) => s !== null);

  // Three input modes:
  //   - PointerSensor: mouse + trackpad (5px deadzone prevents accidental drags
  //     when the user just wants to click).
  //   - TouchSensor: 200ms long-press before drag starts so vertical scroll
  //     still works on mobile.
  //   - KeyboardSensor: Tab to focus an avatar, Space to pick up, arrow keys
  //     to move, Space again to drop. Critical for vision-impaired users.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findContainerOf(vtuberId: number): string {
    if (state.pool.includes(vtuberId)) return POOL_ID;
    const slotIdx = state.slots.findIndex((s) => s === vtuberId);
    if (slotIdx >= 0) return slotId(slotIdx + 1);
    return POOL_ID; // shouldn't happen
  }

  function resolveTargetContainer(overId: string): string | null {
    if (overId === POOL_ID) return POOL_ID;
    if (overId.startsWith("slot-")) return overId;
    if (overId.startsWith("v-")) {
      const otherVtuberId = parseItemId(overId);
      if (state.pool.includes(otherVtuberId)) return POOL_ID;
      const slotIdx = state.slots.findIndex((s) => s === otherVtuberId);
      if (slotIdx >= 0) return slotId(slotIdx + 1);
    }
    return null;
  }

  function applyMove(activeVtuberId: number, sourceContainer: string, targetContainer: string, overId: string) {
    setState((prev) => {
      // Reorder within pool
      if (sourceContainer === POOL_ID && targetContainer === POOL_ID) {
        const oldIdx = prev.pool.indexOf(activeVtuberId);
        let newIdx: number;
        if (overId.startsWith("v-")) {
          newIdx = prev.pool.indexOf(parseItemId(overId));
        } else {
          newIdx = prev.pool.length - 1;
        }
        if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return prev;
        return { ...prev, pool: arrayMove(prev.pool, oldIdx, newIdx) };
      }

      // Pool → slot
      if (sourceContainer === POOL_ID && targetContainer.startsWith("slot-")) {
        const rank = parseSlotId(targetContainer);
        const slotIdx = rank - 1;
        const newSlots = [...prev.slots];
        const ejected = newSlots[slotIdx];
        newSlots[slotIdx] = activeVtuberId;
        const newPool = prev.pool.filter((id) => id !== activeVtuberId);
        if (ejected !== null) newPool.push(ejected);
        return { pool: newPool, slots: newSlots };
      }

      // Slot → pool
      if (sourceContainer.startsWith("slot-") && targetContainer === POOL_ID) {
        const sourceRank = parseSlotId(sourceContainer);
        const newSlots = [...prev.slots];
        newSlots[sourceRank - 1] = null;
        const newPool = [...prev.pool];
        if (overId.startsWith("v-")) {
          const overIdx = newPool.indexOf(parseItemId(overId));
          if (overIdx >= 0) newPool.splice(overIdx, 0, activeVtuberId);
          else newPool.push(activeVtuberId);
        } else {
          newPool.push(activeVtuberId);
        }
        return { pool: newPool, slots: newSlots };
      }

      // Slot → slot (swap)
      if (sourceContainer.startsWith("slot-") && targetContainer.startsWith("slot-")) {
        const sourceRank = parseSlotId(sourceContainer);
        const targetRank = parseSlotId(targetContainer);
        if (sourceRank === targetRank) return prev;
        const newSlots = [...prev.slots];
        newSlots[targetRank - 1] = activeVtuberId;
        newSlots[sourceRank - 1] = prev.slots[targetRank - 1];
        return { ...prev, slots: newSlots };
      }

      return prev;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(parseItemId(String(event.active.id)));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (!activeIdStr.startsWith("v-")) return;

    const activeVtuberId = parseItemId(activeIdStr);
    const sourceContainer = findContainerOf(activeVtuberId);
    const targetContainer = resolveTargetContainer(overIdStr);
    if (!targetContainer) return;

    applyMove(activeVtuberId, sourceContainer, targetContainer, overIdStr);
  }

  async function handleSubmit() {
    if (!isComplete || submitting) return;
    setSubmitting(true);
    try {
      const userUuid = getOrCreateUserId();
      const ranking = state.slots.map((vtuberId, idx) => ({
        vtuberId: vtuberId as number,
        rank: idx + 1,
      }));
      const result = await submitRanking({ userUuid, ranking });
      if (result.ok) {
        markSubmitted();
        toast.success("送出成功！");
        router.push(`/results?u=${userUuid}`);
      } else {
        toast.error(`送出失敗：${result.error}`);
        setSubmitting(false);
      }
    } catch (e) {
      toast.error(`送出失敗：${e instanceof Error ? e.message : "未知錯誤"}`);
      setSubmitting(false);
    }
  }

  function handleReset() {
    if (!confirm("確定要清空目前的排名重來嗎？")) return;
    clearDraft();
    setState(freshState(vtubers));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
        {/* CANDIDATE POOL */}
        <PoolContainer remaining={remaining}>
          <SortableContext items={state.pool.map(itemId)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-5 justify-items-center gap-2 md:grid-cols-4">
              {state.pool.map((vtuberId) => (
                <SortableVtuber
                  key={vtuberId}
                  vtuber={byId[vtuberId]}
                  size={48}
                  inSlot={false}
                />
              ))}
            </div>
          </SortableContext>
        </PoolContainer>

        {/* RANK SLOTS 1..15 */}
        <ol className="flex flex-col gap-1">
          {state.slots.map((vtuberId, idx) => {
            const rank = idx + 1;
            return (
              <RankSlotRow
                key={rank}
                rank={rank}
                vtuberId={vtuberId}
                vtuber={vtuberId !== null ? byId[vtuberId] : null}
              />
            );
          })}
        </ol>
      </div>

      {/* SUBMIT BAR */}
      <div className="sticky bottom-3 z-10 mt-5 flex items-center justify-between gap-3 rounded-card border-[1.5px] border-edge bg-cream-card/95 px-4 py-2.5 backdrop-blur">
        <span className="text-xs text-ink-mute">
          {remaining > 0 ? `還有 ${remaining} 位待安排` : "全部排好了，可以送出"}
          {submissionCount > 0 && (
            <span className="ml-2 text-ink-ghost">· 已有 {submissionCount.toLocaleString()} 人投票</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {state.slots.some((s) => s !== null) && (
            <button
              onClick={handleReset}
              className="rounded-full border border-edge-soft bg-cream px-3 py-1.5 text-xs text-ink-mute hover:bg-cream-deep"
            >
              重來
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-medium transition ${
              !isComplete || submitting
                ? "cursor-not-allowed border-edge-soft bg-edge text-ink-mute"
                : "border-ink bg-rank-cold text-[#2D4A3A] hover:bg-rank-cool"
            }`}
          >
            {submitting ? "送出中…" : "送出我的排名 →"}
          </button>
        </div>
      </div>

      {/* DRAG OVERLAY — what the user sees following their cursor.
          Slight scale + shadow gives a "lifted" feel. */}
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {draggingId !== null ? (
          <div
            className="cursor-grabbing transition-transform"
            style={{
              transform: "scale(1.1) rotate(-3deg)",
              filter: "drop-shadow(0 8px 12px rgba(58,53,48,0.25))",
            }}
          >
            <Avatar vtuber={byId[draggingId]} size={48} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ----------------------------------------------------------------
// Pool container — droppable wrapper around the SortableContext
// ----------------------------------------------------------------
function PoolContainer({ remaining, children }: { remaining: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-card border-[1.5px] border-dashed p-3 transition-all duration-150 ${
        isOver
          ? "border-edge bg-cream-deep ring-2 ring-edge ring-offset-2"
          : "border-edge-soft bg-cream-card"
      }`}
    >
      <p className="mb-2 text-center text-[11px] text-ink-mute">
        候選池 · 還有 {remaining} 位待安排
      </p>
      {children}
      <p className="mt-3 rounded-md bg-cream-deep px-2.5 py-1.5 text-center text-[11px] text-ink-mute md:hidden">
        把頭貼往下拖 ↓
      </p>
      <p className="mt-3 hidden rounded-md bg-cream-deep px-2.5 py-1.5 text-center text-[11px] text-ink-mute md:block">
        把頭貼往右拖 →
      </p>
    </div>
  );
}

// ----------------------------------------------------------------
// Single rank slot (1 .. 15)
// ----------------------------------------------------------------
function RankSlotRow({
  rank,
  vtuberId,
  vtuber,
}: {
  rank: number;
  vtuberId: number | null;
  vtuber: Vtuber | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId(rank) });
  const c = rankColor(rank);
  const filled = vtuberId !== null && vtuber !== null;
  const items = filled ? [itemId(vtuberId)] : [];

  // Visual states:
  //   filled + idle    → solid colored border, normal bg
  //   filled + isOver  → same border + ring + deep bg (signals "swap target")
  //   empty  + idle    → dashed soft border, normal bg
  //   empty  + isOver  → solid edge border + ring + deep bg (signals "drop here")
  const borderTypeClass = filled || isOver ? "border-solid" : "border-dashed";
  const borderColor = filled ? c.bg : isOver ? "#C9BBA0" : "#C9BBA0";
  const stateClass = isOver
    ? "bg-cream-deep ring-2 ring-edge ring-offset-1"
    : "bg-cream-card";

  return (
    <li
      ref={setNodeRef}
      className={`flex items-center gap-2.5 rounded-slot border-[1.5px] px-3 py-1.5 transition-all duration-150 ${borderTypeClass} ${stateClass}`}
      style={{ borderColor }}
    >
      <span
        className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
        style={{ background: c.bg, color: c.fg }}
      >
        {rank}
      </span>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {filled && vtuber ? (
          <SortableVtuber vtuber={vtuber} size={36} inSlot />
        ) : (
          <span
            aria-hidden="true"
            className="h-9 w-9 flex-shrink-0 rounded-full border-[1.5px] border-dashed border-edge-soft"
          />
        )}
      </SortableContext>
      <span className="text-[12px] text-ink">
        {filled ? vtuber?.name : <span className="text-ink-ghost">拖一個進來</span>}
      </span>
      {rank === 1 && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: c.bg, color: c.fg }}
        >
          最奇怪
        </span>
      )}
      {rank === 15 && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: c.bg, color: c.fg }}
        >
          最不奇怪
        </span>
      )}
    </li>
  );
}

// ----------------------------------------------------------------
// Sortable Vtuber avatar — both pool and slot use this
// ----------------------------------------------------------------
function SortableVtuber({
  vtuber,
  size,
  inSlot,
}: {
  vtuber: Vtuber;
  size: number;
  inSlot: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: itemId(vtuber.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // hide the static one while DragOverlay shows the moving copy
    touchAction: "none",
  };

  // Hover scale gives a subtle "I'm interactive" cue. Disabled inside a slot
  // because the surrounding row already has its own hover/over state.
  const hoverClass = inSlot ? "" : "hover:scale-110";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab transition-transform duration-150 active:cursor-grabbing ${hoverClass}`}
      aria-label={`${vtuber.code} ${vtuber.name}`}
    >
      <Avatar vtuber={vtuber} size={size} />
    </div>
  );
}
