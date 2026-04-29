// localStorage helpers for the in-progress draft ranking.
// All functions are browser-only — call from "use client" components only.

const DRAFT_KEY = "relive-oddball:draft";
const SUBMITTED_KEY = "relive-oddball:submitted";

// Slots layout:
//   slots[0] = vtuber id placed at rank 1, or null
//   slots[1] = rank 2, etc., up to slots[14] = rank 15
//   pool    = unranked vtuber ids in candidate-pool order
export type DraftState = {
  pool: number[];
  slots: (number | null)[];
};

function isDraftValid(d: unknown): d is DraftState {
  if (!d || typeof d !== "object") return false;
  const obj = d as Record<string, unknown>;
  if (!Array.isArray(obj.pool) || !Array.isArray(obj.slots)) return false;
  if (obj.slots.length !== 15) return false;
  // Combined coverage must be exactly the 15 ids 1..15.
  const allIds = [
    ...(obj.pool as unknown[]),
    ...(obj.slots as unknown[]).filter((x) => x !== null),
  ];
  if (allIds.length !== 15) return false;
  const set = new Set(allIds.filter((x): x is number => typeof x === "number"));
  if (set.size !== 15) return false;
  for (let i = 1; i <= 15; i++) if (!set.has(i)) return false;
  return true;
}

export function loadDraft(): DraftState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isDraftValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDraft(state: DraftState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function markSubmitted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
}

export function lastSubmittedAt(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SUBMITTED_KEY);
}
