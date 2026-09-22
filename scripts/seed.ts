// One-off seed runner: node --env-file=.env.local scripts/seed.ts
// Idempotent — safe to re-run (upserts on slug).
import { createClient } from "@supabase/supabase-js";
import { SEED_PACKAGES } from "../lib/data/seed-packages.ts";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const rows = SEED_PACKAGES.map((p) => ({
  slug: p.slug,
  title: p.title,
  destination: p.destination,
  region: p.region,
  category: p.category,
  short_description: p.short_description,
  description: p.description,
  duration_days: p.duration_days,
  duration_nights: p.duration_nights,
  base_price_cents: p.base_price_cents,
  max_group_size: p.max_group_size,
  departure_city: p.departure_city,
  gallery: p.gallery,
  highlights: p.highlights,
  itinerary: p.itinerary,
  includes: p.includes,
  excludes: p.excludes,
  meeting_point: p.meeting_point,
  policies: p.policies,
  status: p.status,
  featured: p.featured,
  updated_at: new Date().toISOString(),
}));

const { error } = await supabase.from("packages").upsert(rows, { onConflict: "slug" });
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`Seeded ${rows.length} packages (${rows.filter((r) => r.status === "published").length} published).`);
