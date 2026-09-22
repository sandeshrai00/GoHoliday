import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ponytail: SERVER ONLY — never import from a client component. The service-role
// key bypasses RLS, so it must never reach the browser (no VITE_ prefix, worker
// secrets only). Client reads happen through API routes gated by lib/auth.ts.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
