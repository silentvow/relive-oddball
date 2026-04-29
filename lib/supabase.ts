// Two Supabase clients:
//   - browserSupabase: uses the anon key, runs on the client.
//   - serverSupabase:  uses the service-role key, runs only inside Server
//                      Actions / route handlers. NEVER import from a "use client"
//                      component — it would leak the key.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _browserClient: SupabaseClient | null = null;

export function browserSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase env vars missing — copy .env.local.example to .env.local");
  }
  if (!_browserClient) {
    _browserClient = createClient(url, anonKey);
  }
  return _browserClient;
}

export function serverSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — required for server actions");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
