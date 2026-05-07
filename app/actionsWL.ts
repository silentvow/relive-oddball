"use server";

// Wang-low (7-Vtuber) submit action. Independent from the main submitRanking —
// writes to *_wl tables and revalidates /wang-low/results.

import { revalidatePath } from "next/cache";
import { serverSupabase } from "@/lib/supabase";

export type SubmitInputWL = {
  userUuid: string;
  ranking: { vtuberId: number; rank: number }[];
};

export type SubmitResultWL = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLOT_COUNT = 7;

export async function submitRankingWL(input: SubmitInputWL): Promise<SubmitResultWL> {
  // -------- validation --------
  if (!UUID_RE.test(input.userUuid)) {
    return { ok: false, error: "invalid user id" };
  }
  if (input.ranking.length !== SLOT_COUNT) {
    return { ok: false, error: `must rank all ${SLOT_COUNT} vtubers` };
  }
  const ranks = input.ranking.map((r) => r.rank);
  const ids = input.ranking.map((r) => r.vtuberId);
  if (new Set(ranks).size !== SLOT_COUNT || ranks.some((r) => r < 1 || r > SLOT_COUNT)) {
    return { ok: false, error: `ranks must be a permutation of 1..${SLOT_COUNT}` };
  }
  if (new Set(ids).size !== SLOT_COUNT || ids.some((id) => id < 1 || id > SLOT_COUNT)) {
    return { ok: false, error: `vtuber ids must be a permutation of 1..${SLOT_COUNT}` };
  }

  // -------- write --------
  const sb = serverSupabase();
  const now = new Date().toISOString();

  const { error: subErr } = await sb
    .from("submissions_wl")
    .upsert({ user_uuid: input.userUuid, updated_at: now }, { onConflict: "user_uuid" });
  if (subErr) return { ok: false, error: subErr.message };

  const { error: delErr } = await sb
    .from("rankings_wl")
    .delete()
    .eq("user_uuid", input.userUuid);
  if (delErr) return { ok: false, error: delErr.message };

  const rows = input.ranking.map((r) => ({
    user_uuid: input.userUuid,
    vtuber_id: r.vtuberId,
    rank: r.rank,
  }));
  const { error: insErr } = await sb.from("rankings_wl").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/wang-low/results");
  return { ok: true };
}
