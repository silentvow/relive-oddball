// localStorage helpers for the wang-low (7-Vtuber) draft ranking.
// Mirrors lib/storage.ts but with a separate key space and 7-slot validation,
// so a draft from one ranking never bleeds into the other.

const DRAFT_KEY = "relive-oddball:draft:wl";
const SUBMITTED_KEY = "relive-oddball:submitted:wl";

const SLOT_COUNT = 7;

export type DraftStateWL = {
  pool: number[];
  slots: (number | null)[]; // length 7
};

function isDraftValid(d: unknown): d is DraftStateWL {
  if (!d || typeof d !== "object") return false;
  const obj = d as Record<string, unknown>;
  if (!Array.isArray(obj.pool) || !Array.isArray(obj.slots)) return false;
  if (obj.slots.length !== SLOT_COUNT) return false;
  const allIds = [
    ...(obj.pool as unknown[]),
    ...(obj.slots as unknown[]).filter((x) => x !== null),
  ];
  if (allIds.length !== SLOT_COUNT) return false;
  const set = new Set(allIds.filter((x): x is number => typeof x === "number"));
  if (set.size !== SLOT_COUNT) return false;
  for (let i = 1; i <= SLOT_COUNT; i++) if (!set.has(i)) return false;
  return true;
}

export function loadDraftWL(): DraftStateWL | null {
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

export function saveDraftWL(state: DraftStateWL): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

export function clearDraftWL(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function markSubmittedWL(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
}
