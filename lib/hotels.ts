import { getSupabase } from "@/lib/supabase";
import { LEGAL_TRANSITIONS, slugify } from "@/lib/admin";
import type { BookingStatus, Hotel, HotelBooking, HotelSummary } from "@/types";
import type { HotelFormValues } from "@/lib/validation";

// ponytail: SERVER ONLY — service-role reads/writes. Catalog mirrors lib/catalog:
// published-only for the public, everything for admin.

export interface HotelFilters {
  search?: string;
  location?: string;
  sort?: "price-asc" | "price-desc" | "stars" | "newest";
  limit?: number;
  offset?: number;
}

const SUMMARY_COLUMNS =
  "id,slug,name,location,star_rating,from_price_cents,short_description,featured,gallery";

export function toHotelSummary(row: Record<string, unknown>): HotelSummary {
  const gallery = Array.isArray(row.gallery) ? (row.gallery as Hotel["gallery"]) : [];
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    location: row.location as string,
    star_rating: row.star_rating as number,
    from_price_cents: row.from_price_cents as number,
    short_description: row.short_description as string,
    featured: row.featured as boolean,
    cover: gallery.length > 0 ? gallery[0] : null,
  };
}

export async function listHotels(filters: HotelFilters = {}): Promise<{ items: HotelSummary[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 12, 1), 50);
  const offset = Math.max(filters.offset ?? 0, 0);

  let query = getSupabase().from("hotels").select(SUMMARY_COLUMNS, { count: "exact" }).eq("status", "published");

  if (filters.search?.trim()) {
    const safe = filters.search.trim().slice(0, 80).replace(/[,()]/g, "");
    query = query.or(`name.ilike.%${safe}%,location.ilike.%${safe}%`);
  }
  if (filters.location?.trim()) query = query.eq("location", filters.location.trim().slice(0, 120));

  switch (filters.sort) {
    case "price-asc":
      query = query.order("from_price_cents", { ascending: true });
      break;
    case "price-desc":
      query = query.order("from_price_cents", { ascending: false });
      break;
    case "stars":
      query = query.order("star_rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("from_price_cents");
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`listHotels: ${error.message}`);
  const items = (data ?? []).map(toHotelSummary);
  return { items, total: count ?? items.length };
}

export async function getHotel(slug: string): Promise<Hotel | null> {
  const { data, error } = await getSupabase()
    .from("hotels")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`getHotel: ${error.message}`);
  return (data as Hotel | null) ?? null;
}

async function uniqueHotelSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = getSupabase();
  const slug = slugify(base) || "hotel";
  for (let n = 0; ; n++) {
    const candidate = n === 0 ? slug : `${slug}-${n + 1}`;
    let query = supabase.from("hotels").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
}

function toHotelRow(values: HotelFormValues, slug: string) {
  const room_types = values.room_types.map((r) => ({
    name: r.name,
    price_cents_per_night: Math.round(r.price_per_night_usd * 100),
    max_guests: r.max_guests,
    description: r.description || "",
  }));
  return {
    slug,
    name: values.name,
    location: values.location,
    region: values.region || "Thailand",
    star_rating: values.star_rating,
    short_description: values.short_description,
    description: values.description || "",
    gallery: values.gallery_urls.map((url) => ({ url, alt: values.name })),
    amenities: values.amenities,
    check_in_time: values.check_in_time,
    check_out_time: values.check_out_time,
    room_types,
    from_price_cents: Math.min(...room_types.map((r) => r.price_cents_per_night)),
    policies: values.policies || null,
    status: values.status,
    featured: values.featured,
    updated_at: new Date().toISOString(),
  };
}

export interface AdminHotel extends Hotel {
  booking_count: number;
}

export async function listHotelsAdmin(): Promise<AdminHotel[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("hotels")
    .select("*, hotel_bookings(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listHotelsAdmin: ${error.message}`);
  return ((data ?? []) as Array<Hotel & { hotel_bookings: Array<{ count: number }> }>).map((row) => ({
    ...row,
    booking_count: row.hotel_bookings?.[0]?.count ?? 0,
  }));
}

export async function createHotelAdmin(values: HotelFormValues): Promise<Hotel> {
  const slug = await uniqueHotelSlug(values.slug?.trim() || values.name);
  const { data, error } = await getSupabase().from("hotels").insert(toHotelRow(values, slug)).select().single();
  if (error) throw new Error(`createHotelAdmin: ${error.message}`);
  return data as Hotel;
}

export async function updateHotelAdmin(id: string, values: HotelFormValues): Promise<Hotel> {
  const slug = await uniqueHotelSlug(values.slug?.trim() || values.name, id);
  const { data, error } = await getSupabase()
    .from("hotels")
    .update(toHotelRow(values, slug))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateHotelAdmin: ${error.message}`);
  return data as Hotel;
}

export async function deleteHotelAdmin(id: string): Promise<void> {
  const supabase = getSupabase();
  const { count, error: countErr } = await supabase
    .from("hotel_bookings")
    .select("id", { count: "exact", head: true })
    .eq("hotel_id", id);
  if (countErr) throw new Error(`deleteHotelAdmin: ${countErr.message}`);
  if ((count ?? 0) > 0) {
    const err = new Error("Hotel has bookings and cannot be deleted. Unpublish it instead.") as Error & {
      status?: number;
    };
    err.status = 409;
    throw err;
  }
  const { error } = await supabase.from("hotels").delete().eq("id", id);
  if (error) throw new Error(`deleteHotelAdmin: ${error.message}`);
}

export interface AdminHotelBooking extends HotelBooking {
  customer_email: string | null;
}

export async function listHotelBookingsAdmin(status?: string): Promise<AdminHotelBooking[]> {
  let query = getSupabase()
    .from("hotel_bookings")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });
  if (status && ["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw new Error(`listHotelBookingsAdmin: ${error.message}`);
  return ((data ?? []) as Array<HotelBooking & { profiles: { email: string } | null }>).map((row) => ({
    ...row,
    customer_email: row.contact_email ?? row.profiles?.email ?? null,
  }));
}

export async function updateHotelBookingStatusAdmin(id: string, status: BookingStatus): Promise<HotelBooking> {
  const supabase = getSupabase();
  const { data: current, error: curErr } = await supabase
    .from("hotel_bookings")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (curErr) throw new Error(`updateHotelBookingStatusAdmin: ${curErr.message}`);
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
    .from("hotel_bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateHotelBookingStatusAdmin: ${error.message}`);
  return data as HotelBooking;
}
