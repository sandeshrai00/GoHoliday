import { getSupabase } from "@/lib/supabase";
import type { Booking, BookingStatus, Package } from "@/types";
import type { PackageFormValues } from "@/lib/validation";

// ponytail: SERVER ONLY — service-role writes live here. Admin API routes are
// thin wrappers; every one re-verifies requireApiRole itself.

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = getSupabase();
  let slug = slugify(base) || "package";
  for (let n = 0; ; n++) {
    const candidate = n === 0 ? slug : `${slug}-${n + 1}`;
    let query = supabase.from("packages").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
}

function toDbRow(values: PackageFormValues, slug: string) {
  return {
    slug,
    title: values.title,
    destination: values.destination,
    region: values.region || "Thailand",
    category: values.category,
    short_description: values.short_description,
    description: values.description || "",
    duration_days: values.duration_days,
    duration_nights: values.duration_nights,
    base_price_cents: Math.round(values.base_price_usd * 100),
    max_group_size: values.max_group_size,
    departure_city: values.departure_city || null,
    gallery: values.gallery_urls.map((url) => ({ url, alt: values.title })),
    highlights: values.highlights,
    itinerary: values.itinerary,
    includes: values.includes,
    excludes: values.excludes,
    meeting_point: values.meeting_point || null,
    policies: values.policies || null,
    status: values.status,
    featured: values.featured,
    updated_at: new Date().toISOString(),
  };
}

export interface AdminPackage extends Package {
  booking_count: number;
}

export async function listPackagesAdmin(): Promise<AdminPackage[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("packages")
    .select("*, bookings(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listPackagesAdmin: ${error.message}`);
  return ((data ?? []) as Array<Package & { bookings: Array<{ count: number }> }>).map((row) => ({
    ...row,
    booking_count: row.bookings?.[0]?.count ?? 0,
  }));
}

export async function createPackageAdmin(values: PackageFormValues): Promise<Package> {
  const slug = await uniqueSlug(values.slug?.trim() || values.title);
  const { data, error } = await getSupabase().from("packages").insert(toDbRow(values, slug)).select().single();
  if (error) throw new Error(`createPackageAdmin: ${error.message}`);
  return data as Package;
}

export async function updatePackageAdmin(id: string, values: PackageFormValues): Promise<Package> {
  const slug = await uniqueSlug(values.slug?.trim() || values.title, id);
  const { data, error } = await getSupabase()
    .from("packages")
    .update(toDbRow(values, slug))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updatePackageAdmin: ${error.message}`);
  return data as Package;
}

export async function deletePackageAdmin(id: string): Promise<void> {
  const supabase = getSupabase();
  const { count, error: countErr } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("package_id", id);
  if (countErr) throw new Error(`deletePackageAdmin: ${countErr.message}`);
  if ((count ?? 0) > 0) {
    const err = new Error("Package has bookings and cannot be deleted. Unpublish it instead.") as Error & {
      status?: number;
    };
    err.status = 409;
    throw err;
  }
  // FK RESTRICT is the backstop; the count check above gives the friendly 409.
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw new Error(`deletePackageAdmin: ${error.message}`);
}

export interface AdminBooking extends Booking {
  customer_email: string | null;
}

export async function listBookingsAdmin(status?: string): Promise<AdminBooking[]> {
  let query = getSupabase()
    .from("bookings")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });
  if (status && ["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw new Error(`listBookingsAdmin: ${error.message}`);
  return ((data ?? []) as Array<Booking & { profiles: { email: string } | null }>).map((row) => ({
    ...row,
    customer_email: row.contact_email ?? row.profiles?.email ?? null,
  }));
}

/** Shared with hotel booking status changes — one transition map. */
export const LEGAL_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export async function updateBookingStatusAdmin(id: string, status: BookingStatus): Promise<Booking> {
  const supabase = getSupabase();
  const { data: current, error: curErr } = await supabase.from("bookings").select("status").eq("id", id).maybeSingle();
  if (curErr) throw new Error(`updateBookingStatusAdmin: ${curErr.message}`);
  if (!current) {
    const err = new Error("Booking not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  if (!LEGAL_TRANSITIONS[current.status as BookingStatus].includes(status)) {
    const err = new Error(`Cannot move booking from ${current.status} to ${status}`) as Error & { status?: number };
    err.status = 409;
    throw err;
  }
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateBookingStatusAdmin: ${error.message}`);
  return data as Booking;
}

export interface Metrics {
  bookings_total: number;
  bookings_pending: number;
  revenue_cents: number;
  customers: number;
  packages_published: number;
}

export async function getMetricsAdmin(): Promise<Metrics> {
  const supabase = getSupabase();
  const [bookings, revenue, customers, packages] = await Promise.all([
    supabase.from("bookings").select("status"),
    supabase.from("bookings").select("total_price_cents").eq("status", "confirmed"),
    supabase.from("profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("packages").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);
  if (bookings.error) throw new Error(`getMetricsAdmin: ${bookings.error.message}`);
  const list = (bookings.data ?? []) as Array<{ status: string }>;
  return {
    bookings_total: list.length,
    bookings_pending: list.filter((b) => b.status === "pending").length,
    revenue_cents:
      (revenue.data as Array<{ total_price_cents: number }> | null)?.reduce((s, r) => s + r.total_price_cents, 0) ?? 0,
    customers: customers.count ?? 0,
    packages_published: packages.count ?? 0,
  };
}

export async function updateRatesAdmin(rates: { EUR: number; NPR: number; THB: number }): Promise<void> {
  const { error } = await getSupabase()
    .from("currency_rates")
    .upsert(
      (Object.entries(rates) as Array<["EUR" | "NPR" | "THB", number]>).map(([code, rate]) => ({
        code,
        rate,
        updated_at: new Date().toISOString(),
      })),
    );
  if (error) throw new Error(`updateRatesAdmin: ${error.message}`);
}
