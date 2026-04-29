// Server-side data loaders. Import only from server components / Server Actions.

import { serverSupabase } from "@/lib/supabase";
import type { Vtuber } from "@/lib/vtubers";

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

export async function fetchVtubers(): Promise<Vtuber[]> {
  const { data, error } = await serverSupabase()
    .from("vtubers")
    .select("id, code, name, avatar_url, bg_color, fg_color, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToVtuber);
}

export async function fetchSubmissionCount(): Promise<number> {
  const { data, error } = await serverSupabase()
    .from("submissions_count")
    .select("total")
    .single();
  if (error) throw error;
  return data?.total ?? 0;
}

// ---------------- Results-page loaders ----------------

export type LeaderboardRow = Vtuber & {
  avgRank: number;
  medianRank: number;
  voteCount: number;
  bayesRank: number;
};

// Fetches the global leaderboard, ordered by Bayesian smoothed avg ascending
// (= weirdest first). Bayesian smoothing keeps low-vote-count Vtubers from
// getting pinned to extreme ends when only a handful of people have voted.
export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await serverSupabase()
    .from("leaderboard")
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
    displayOrder: 0, // not meaningful for leaderboard rows
    avgRank: Number(row.avg_rank),
    medianRank: Number(row.median_rank),
    voteCount: row.vote_count,
    bayesRank: Number(row.bayes_rank),
  }));
}

// 15x15 matrix: rows[vtuberId-1][rank-1] = vote count for that (vtuber, rank).
// Sparse rows from the DB are filled with zeros so the heatmap can render
// every cell without conditional checks.
export async function fetchHeatmap(): Promise<number[][]> {
  const { data, error } = await serverSupabase()
    .from("rank_distribution")
    .select("vtuber_id, rank, vote_count");
  if (error) throw error;

  const matrix: number[][] = Array.from({ length: 15 }, () => Array(15).fill(0));
  for (const row of (data ?? []) as { vtuber_id: number; rank: number; vote_count: number }[]) {
    matrix[row.vtuber_id - 1][row.rank - 1] = row.vote_count;
  }
  return matrix;
}

// Returns the 15 rankings the given user submitted, ordered by rank ascending.
// `null` means the user hasn't submitted yet (no row in the submissions table).
export async function fetchMyRanking(
  userUuid: string,
): Promise<{ vtuberId: number; rank: number }[] | null> {
  const sb = serverSupabase();
  const { data: sub, error: subErr } = await sb
    .from("submissions")
    .select("user_uuid")
    .eq("user_uuid", userUuid)
    .maybeSingle();
  if (subErr) throw subErr;
  if (!sub) return null;

  const { data, error } = await sb
    .from("rankings")
    .select("vtuber_id, rank")
    .eq("user_uuid", userUuid)
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ vtuberId: r.vtuber_id, rank: r.rank }));
}
