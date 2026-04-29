"use server";

// All writes from the public site funnel through this file.
// Uses the service-role client (bypasses RLS) — that's fine because every
// branch validates the input before touching the DB.

import { revalidatePath } from "next/cache";
import { serverSupabase } from "@/lib/supabase";

export type SubmitInput = {
  userUuid: string;
  ranking: { vtuberId: number; rank: number }[];
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function submitRanking(input: SubmitInput): Promise<SubmitResult> {
  // -------- validation --------
  if (!UUID_RE.test(input.userUuid)) {
    return { ok: false, error: "invalid user id" };
  }
  if (input.ranking.length !== 15) {
    return { ok: false, error: "must rank all 15 vtubers" };
  }
  const ranks = input.ranking.map((r) => r.rank);
  const ids = input.ranking.map((r) => r.vtuberId);
  if (new Set(ranks).size !== 15 || ranks.some((r) => r < 1 || r > 15)) {
    return { ok: false, error: "ranks must be a permutation of 1..15" };
  }
  if (new Set(ids).size !== 15 || ids.some((id) => id < 1 || id > 15)) {
    return { ok: false, error: "vtuber ids must be a permutation of 1..15" };
  }

  // -------- write --------
  const sb = serverSupabase();
  const now = new Date().toISOString();

  // Upsert the submission row (creates on first vote, bumps updated_at on revote).
  const { error: subErr } = await sb
    .from("submissions")
    .upsert({ user_uuid: input.userUuid, updated_at: now }, { onConflict: "user_uuid" });
  if (subErr) return { ok: false, error: subErr.message };

  // Replace this user's 15 rankings atomically. Delete-then-insert is fine
  // because the FK is the same user_uuid we just upserted; cascade is on the
  // submissions row, not our explicit delete.
  const { error: delErr } = await sb
    .from("rankings")
    .delete()
    .eq("user_uuid", input.userUuid);
  if (delErr) return { ok: false, error: delErr.message };

  const rows = input.ranking.map((r) => ({
    user_uuid: input.userUuid,
    vtuber_id: r.vtuberId,
    rank: r.rank,
  }));
  const { error: insErr } = await sb.from("rankings").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  // Trigger re-fetch on the results page (when we build it in Phase 4).
  revalidatePath("/results");
  return { ok: true };
}
