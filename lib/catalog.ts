import { getSupabase } from "@/lib/supabase";
import type { CurrencyCode, Package, PackageSummary } from "@/types";

// ponytail: SERVER ONLY — wraps the service-role client. Single home of the
// "published-only" rule: API routes AND server components both call these,
// so the rule can't drift between two implementations.

export interface PackageFilters {
  search?: string;
  destination?: string;
  category?: string;
  featured?: boolean;
  sort?: "price-asc" | "price-desc" | "duration-asc" | "duration-desc" | "newest";
  limit?: number;
  offset?: number;
}

const SORTS: Record<NonNullable<PackageFilters["sort"]>, { column: string; ascending: boolean }> = {
  "price-asc": { column: "base_price_cents", ascending: true },
  "price-desc": { column: "base_price_cents", ascending: false },
  "duration-asc": { column: "duration_days", ascending: true },
  "duration-desc": { column: "duration_days", ascending: false },
  newest: { column: "created_at", ascending: false },
};

const SUMMARY_COLUMNS =
  "id,slug,title,destination,category,duration_days,duration_nights,base_price_cents,short_description,featured,gallery";

export function toSummary(row: Record<string, unknown>): PackageSummary {
  const gallery = Array.isArray(row.gallery) ? (row.gallery as Package["gallery"]) : [];
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    destination: row.destination as string,
    category: row.category as string,
    duration_days: row.duration_days as number,
    duration_nights: row.duration_nights as number,
    base_price_cents: row.base_price_cents as number,
    short_description: row.short_description as string,
    featured: row.featured as boolean,
    cover: gallery.length > 0 ? gallery[0] : null,
  };
}

export async function listPackages(filters: PackageFilters = {}): Promise<{ items: PackageSummary[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 12, 1), 50);
  const offset = Math.max(filters.offset ?? 0, 0);

  let query = getSupabase().from("packages").select(SUMMARY_COLUMNS, { count: "exact" }).eq("status", "published");

  if (filters.search?.trim()) {
    const safe = filters.search.trim().slice(0, 80).replace(/[,()]/g, "");
    query = query.or(`title.ilike.%${safe}%,destination.ilike.%${safe}%`);
  }
  if (filters.destination?.trim()) query = query.eq("destination", filters.destination.trim().slice(0, 60));
  if (filters.category?.trim()) query = query.eq("category", filters.category.trim().slice(0, 60));
  if (filters.featured) query = query.eq("featured", true);

  const sort = filters.sort ? SORTS[filters.sort] : null;
  if (sort) query = query.order(sort.column, { ascending: sort.ascending });
  else query = query.order("featured", { ascending: false }).order("base_price_cents");

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`listPackages: ${error.message}`);
  const items = (data ?? []).map(toSummary);
  return { items, total: count ?? items.length };
}

export async function getPackage(slug: string): Promise<Package | null> {
  const { data, error } = await getSupabase()
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`getPackage: ${error.message}`);
  return (data as Package | null) ?? null;
}

export interface Destination {
  name: string;
  count: number;
  image: Package["gallery"][number] | null;
}

export async function getDestinations(): Promise<Destination[]> {
  const { data, error } = await getSupabase()
    .from("packages")
    .select("destination,gallery")
    .eq("status", "published");
  if (error) throw new Error(`getDestinations: ${error.message}`);
  const byDestination = new Map<string, Destination>();
  for (const row of data ?? []) {
    const entry = byDestination.get(row.destination) ?? { name: row.destination, count: 0, image: null };
    entry.count += 1;
    if (!entry.image && Array.isArray(row.gallery) && row.gallery.length > 0) entry.image = row.gallery[0];
    byDestination.set(row.destination, entry);
  }
  return [...byDestination.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getRates(): Promise<{ base: "USD"; rates: Record<CurrencyCode, number> }> {
  const { data, error } = await getSupabase().from("currency_rates").select("code,rate");
  if (error) throw new Error(`getRates: ${error.message}`);
  const rates: Record<CurrencyCode, number> = { USD: 1, EUR: 0, NPR: 0, THB: 0 };
  for (const row of data ?? []) rates[row.code as CurrencyCode] = Number(row.rate);
  return { base: "USD", rates };
}
