// Type definitions and visual helpers shared between server and client.
// Vtuber rows live in Supabase from Phase 3 onwards — see lib/data.ts for the loader.

export type Vtuber = {
  id: number;             // 1..15, matches DB primary key
  code: string;           // "RL-01" — used as fallback display name during dev
  name: string;           // display name (= code while still using placeholders)
  avatarUrl: string | null;
  bgColor: string;        // hex incl. "#" — for SVG placeholder fallback
  fgColor: string;        // hex incl. "#" — placeholder text color
  displayOrder: number;
};

// Rank-pill color by 1-indexed rank position. Five segments:
//   1-3 hot, 4-6 warm, 7-9 mid, 10-12 cool, 13-15 cold.
export function rankColor(rank: number): { bg: string; fg: string } {
  if (rank <= 3)  return { bg: "#C49B8C", fg: "#4A1B0C" };
  if (rank <= 6)  return { bg: "#D9BFA8", fg: "#5A3A1F" };
  if (rank <= 9)  return { bg: "#DDC987", fg: "#5A4A1F" };
  if (rank <= 12) return { bg: "#C5D4A8", fg: "#2A4A0F" };
  return                { bg: "#B8D4C4", fg: "#2D4A3A" };
}
