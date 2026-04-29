// Anonymous client-side identity.
// On first visit we generate a UUID v4 and persist it in localStorage so the
// same browser keeps the same identity across sessions. The submit endpoint
// uses this UUID as the upsert key so a person can update their ranking
// without creating a new row.

const KEY = "relive-oddball:user-uuid";

function uuidv4(): string {
  // crypto.randomUUID is available in modern browsers and Node 19+.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 fallback.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Browser-only — call from a useEffect or a "use client" component.
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateUserId must run in the browser");
  }
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
