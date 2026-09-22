import { getSupabase } from "@/lib/supabase";
import { ensureProfile, makeRef, tomorrowUtc } from "@/lib/bookings";
import type { CurrencyCode, HotelBooking } from "@/types";
import type { HotelBookingInput } from "@/lib/validation";

// ponytail: SERVER ONLY — mirrors lib/bookings, separate table per the
// "readable data, separate code files" decision. Ref/date/currency logic is
// shared (imported), never copied.

export async function createHotelBooking(userId: string, input: HotelBookingInput): Promise<HotelBooking> {
  const supabase = getSupabase();

  const { data: hotel, error: hotelErr } = await supabase
    .from("hotels")
    .select("id,name,location,room_types")
    .eq("id", input.hotel_id)
    .eq("status", "published")
    .maybeSingle();
  if (hotelErr) throw new Error(`createHotelBooking: ${hotelErr.message}`);
  if (!hotel) {
    const err = new Error("Hotel not available") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const room = (hotel.room_types as Array<{ name: string; price_cents_per_night: number; max_guests: number }>).find(
    (r) => r.name.trim().toLowerCase() === input.room_type_name.trim().toLowerCase(),
  );
  if (!room) {
    const err = new Error("Room type not available") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const nights = Math.round((Date.parse(input.end_date) - Date.parse(input.start_date)) / 86400000);
  if (!(nights >= 1 && nights <= 60) || input.start_date < tomorrowUtc()) {
    const err = new Error("Invalid stay dates") as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  if (input.adults + input.children > input.rooms * room.max_guests) {
    const err = new Error(
      `${room.name} sleeps ${room.max_guests} per room — reduce guests or add rooms`,
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const { data: dupe } = await supabase
    .from("hotel_bookings")
    .select("id")
    .eq("user_id", userId)
    .eq("hotel_id", input.hotel_id)
    .eq("start_date", input.start_date)
    .eq("status", "pending")
    .maybeSingle();
  if (dupe) {
    const err = new Error("You already have a pending request for this hotel and date") as Error & {
      status?: number;
    };
    err.status = 409;
    throw err;
  }

  // Price is computed here from the hotel row — a client-sent price is never read.
  const total_price_cents = room.price_cents_per_night * nights * input.rooms;
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
      .from("hotel_bookings")
      .insert({
        booking_ref: makeRef(),
        user_id: userId,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        room_type_name: room.name,
        price_per_night_cents: room.price_cents_per_night,
        start_date: input.start_date,
        end_date: input.end_date,
        nights,
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
    if (!error) return data as HotelBooking;
    if (!error.message.includes("duplicate")) throw new Error(`createHotelBooking: ${error.message}`);
  }
  throw new Error("createHotelBooking: could not generate a unique reference");
}

export async function listHotelBookings(userId: string): Promise<HotelBooking[]> {
  const { data, error } = await getSupabase()
    .from("hotel_bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listHotelBookings: ${error.message}`);
  return (data ?? []) as HotelBooking[];
}

export async function getHotelBooking(id: string): Promise<HotelBooking | null> {
  const { data, error } = await getSupabase().from("hotel_bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getHotelBooking: ${error.message}`);
  return (data as HotelBooking | null) ?? null;
}
