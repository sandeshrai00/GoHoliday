import { randomInt } from "node:crypto";
import { createClerkClient } from "@clerk/backend";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import type { Booking, CurrencyCode } from "@/types";

// ponytail: SERVER ONLY — service-role writes + Clerk lookups. Browser talks
// to /api/bookings, never here.

export const bookingInputSchema = z.object({
  package_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20).default(0),
  rooms: z.number().int().min(1).max(20).default(1),
  currency_code: z.enum(["USD", "EUR", "NPR", "THB"]),
  contact_phone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

/** Self-heal: webhook delay means a fresh user may have no row yet — create it on demand. */
export async function ensureProfile(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { data } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (data) return;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("Missing CLERK_SECRET_KEY");
  const user = await createClerkClient({ secretKey }).users.getUser(userId);
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ?? user.emailAddresses[0];
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      email: (primary?.emailAddress ?? "").toLowerCase(),
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
      avatar_url: user.imageUrl || null,
      role: "user",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`ensureProfile: ${error.message}`);
}

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeRef(): string {
  let ref = "GH-";
  for (let i = 0; i < 6; i++) ref += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return ref;
}

function tomorrowUtc(): string {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

export async function createBooking(userId: string, input: BookingInput): Promise<Booking> {
  const supabase = getSupabase();

  const { data: pkg, error: pkgErr } = await supabase
    .from("packages")
    .select("id,title,destination,base_price_cents")
    .eq("id", input.package_id)
    .eq("status", "published")
    .maybeSingle();
  if (pkgErr) throw new Error(`createBooking: ${pkgErr.message}`);
  if (!pkg) {
    const err = new Error("Package not available") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const nights = Math.round((Date.parse(input.end_date) - Date.parse(input.start_date)) / 86400000);
  if (!(nights >= 1 && nights <= 60) || input.start_date < tomorrowUtc()) {
    const err = new Error("Invalid travel dates") as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const { data: dupe } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", userId)
    .eq("package_id", input.package_id)
    .eq("start_date", input.start_date)
    .eq("status", "pending")
    .maybeSingle();
  if (dupe) {
    const err = new Error("You already have a pending request for this trip and date") as Error & {
      status?: number;
    };
    err.status = 409;
    throw err;
  }

  // Price is computed here from the package row — a client-sent price is never read.
  const total_price_cents = pkg.base_price_cents * (input.adults + input.children);
  const { data: rateRow } = await supabase
    .from("currency_rates")
    .select("rate")
    .eq("code", input.currency_code)
    .maybeSingle();
  const total_price_display = Math.round((total_price_cents / 100) * Number(rateRow?.rate ?? 1));

  await ensureProfile(userId);
  const { data: profile } = await supabase.from("profiles").select("email").eq("user_id", userId).maybeSingle();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_ref: makeRef(),
        user_id: userId,
        package_id: pkg.id,
        package_title: pkg.title,
        destination: pkg.destination,
        start_date: input.start_date,
        end_date: input.end_date,
        adults: input.adults,
        children: input.children,
        rooms: input.rooms,
        total_price_cents,
        currency_code: input.currency_code as CurrencyCode,
        total_price_display,
        status: "pending",
        contact_email: profile?.email ?? null,
        contact_phone: input.contact_phone || null,
        notes: input.notes || null,
      })
      .select()
      .single();
    if (!error) return data as Booking;
    if (!error.message.includes("duplicate")) throw new Error(`createBooking: ${error.message}`);
  }
  throw new Error("createBooking: could not generate a unique reference");
}

export async function listBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listBookings: ${error.message}`);
  return (data ?? []) as Booking[];
}

export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await getSupabase().from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getBooking: ${error.message}`);
  return (data as Booking | null) ?? null;
}
