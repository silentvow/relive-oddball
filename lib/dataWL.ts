// Server-side data loaders for the wang-low (7-Vtuber) ranking.
// Mirrors lib/data.ts but reads from the *_wl tables/views.
// Import only from server components / Server Actions.

import { serverSupabase } from "@/lib/supabase";
import type { Vtuber } from "@/lib/vtubers";
import type { LeaderboardRow } from "@/lib/data";

type VtuberRow = {
  id: number;
  code: string;
  name: string;
  avatar_url: string | null;
  bg_color: string;
  fg_color: string;
  display_order: number;
};

function rowToVtuber(row: VtuberRow): Vtuber {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    avatarUrl: row.avatar_url,
    bgColor: row.bg_color,
    fgColor: row.fg_color,
    displayOrder: row.display_order,
  };
}

export const WL_SLOT_COUNT = 7;

export async function fetchVtubersWL(): Promise<Vtuber[]> {
  const { data, error } = await serverSupabase()
    .from("vtubers_wl")
    .select("id, code, name, avatar_url, bg_color, fg_color, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToVtuber);
}

export async function fetchSubmissionCountWL(): Promise<number> {
  const { data, error } = await serverSupabase()
    .from("submissions_count_wl")
    .select("total")
    .single();
  if (error) throw error;
  return data?.total ?? 0;
}

export async function fetchLeaderboardWL(): Promise<LeaderboardRow[]> {
  const { data, error } = await serverSupabase()
    .from("leaderboard_wl")
    .select("*")
    .order("bayes_rank", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    avatarUrl: row.avatar_url,
    bgColor: row.bg_color,
    fgColor: row.fg_color,
    displayOrder: 0,
    avgRank: Number(row.avg_rank),
    medianRank: Number(row.median_rank),
    voteCount: row.vote_count,
    bayesRank: Number(row.bayes_rank),
  }));
}

// 7×7 matrix.
export async function fetchHeatmapWL(): Promise<number[][]> {
  const { data, error } = await serverSupabase()
    .from("rank_distribution_wl")
    .select("vtuber_id, rank, vote_count");
  if (error) throw error;

  const matrix: number[][] = Array.from({ length: WL_SLOT_COUNT }, () =>
    Array(WL_SLOT_COUNT).fill(0),
  );
  for (const row of (data ?? []) as { vtuber_id: number; rank: number; vote_count: number }[]) {
    matrix[row.vtuber_id - 1][row.rank - 1] = row.vote_count;
  }
  return matrix;
}

export async function fetchMyRankingWL(
  userUuid: string,
): Promise<{ vtuberId: number; rank: number }[] | null> {
  const sb = serverSupabase();
  const { data: sub, error: subErr } = await sb
    .from("submissions_wl")
    .select("user_uuid")
    .eq("user_uuid", userUuid)
    .maybeSingle();
  if (subErr) throw subErr;
  if (!sub) return null;

  const { data, error } = await sb
    .from("rankings_wl")
    .select("vtuber_id, rank")
    .eq("user_uuid", userUuid)
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ vtuberId: r.vtuber_id, rank: r.rank }));
}
