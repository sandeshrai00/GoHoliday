"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/components/site/use-currency";
import { convertFromUsd, formatPrice } from "@/lib/pricing";
import type { HotelBooking, HotelRoomType } from "@/types";

interface Props {
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  rooms: HotelRoomType[];
}

type Phase = "form" | "sending" | "done";

export default function HotelBookingForm({ hotelId, hotelSlug, hotelName, rooms }: Props) {
  const initial = useSearchParams();
  const { isSignedIn, getToken } = useAuth();
  const { currency, rates } = useCurrency();

  const initialRoom = initial.get("room") ?? "";
  const [roomName, setRoomName] = useState(
    rooms.some((r) => r.name === initialRoom) ? initialRoom : (rooms[0]?.name ?? ""),
  );
  const [start, setStart] = useState(initial.get("start") ?? "");
  const [end, setEnd] = useState(initial.get("end") ?? "");
  const [roomCount, setRoomCount] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [formError, setFormError] = useState<string | null>(null);
  const [booking, setBooking] = useState<HotelBooking | null>(null);

  const room = rooms.find((r) => r.name === roomName) ?? rooms[0];
  const nights = useMemo(() => {
    if (!start || !end) return null;
    const n = Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
    return n >= 1 ? n : null;
  }, [start, end]);
  const maxGuests = room ? roomCount * room.max_guests : 0;
  const total = room && nights ? room.price_cents_per_night * nights * roomCount : 0;
  const displayTotal = formatPrice(convertFromUsd(total, rates[currency] ?? 1), currency);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!room) {
      setFormError("This hotel has no rooms to book.");
      return;
    }
    if (!start || !end || nights === null) {
      setFormError("Pick a valid check-in and check-out date.");
      return;
    }
    if (adults + children > maxGuests) {
      setFormError(`${room.name} sleeps ${room.max_guests} per room — reduce guests or add rooms.`);
      return;
    }
    const token = await getToken().catch(() => null);
    if (!token) {
      setFormError("Your session expired. Please sign in again.");
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch("/api/hotel-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hotel_id: hotelId,
          room_type_name: room.name,
          start_date: start,
          end_date: end,
          adults,
          children,
          rooms: roomCount,
          currency_code: currency,
          contact_phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(data?.error ?? "Booking failed. Please try again.");
        setPhase("form");
        return;
      }
      setBooking(data as HotelBooking);
      setPhase("done");
    } catch {
      setFormError("Network error. Please try again.");
      setPhase("form");
    }
  };

  if (phase === "done" && booking) {
    return (
      <div className="rounded-xl border p-8 text-center" role="status">
        <p className="text-sm font-medium text-green-700">Booking request received</p>
        <h2 className="mt-2 text-2xl font-bold">{booking.booking_ref}</h2>
        <p className="mt-2 text-muted-foreground">
          {hotelName} · {booking.room_type_name} · {booking.start_date} → {booking.end_date} · {booking.nights}{" "}
          {booking.nights === 1 ? "night" : "nights"} · {booking.rooms} {booking.rooms === 1 ? "room" : "rooms"}
        </p>
        <p className="mt-1 text-lg font-bold">{displayTotal}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Status: <strong>pending</strong> — our team confirms availability with the hotel and shares payment
          instructions. Nothing is charged now.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href={`/hotel-bookings/${booking.id}`}>View my booking</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/hotels">Browse more hotels</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <h2 className="text-xl font-bold">Sign in to book</h2>
        <p className="mt-2 text-muted-foreground">
          You need an account so we can keep your booking and contact you about confirmation.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  const input = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  const label = "block text-sm font-medium";

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-xl border p-6">
      <label className={label}>
        Room type
        <select value={roomName} onChange={(e) => setRoomName(e.target.value)} className={input}>
          {rooms.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name} — sleeps {r.max_guests}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          Check-in
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required className={input} />
        </label>
        <label className={label}>
          Check-out
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required className={input} />
        </label>
        <label className={label}>
          Rooms
          <input
            type="number"
            min={1}
            max={20}
            value={roomCount}
            onChange={(e) => setRoomCount(Number(e.target.value))}
            required
            className={input}
          />
        </label>
        <label className={label}>
          Adults
          <input
            type="number"
            min={1}
            max={20}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            required
            className={input}
          />
        </label>
        <label className={label}>
          Children
          <input
            type="number"
            min={0}
            max={20}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className={input}
          />
        </label>
        <label className={label}>
          Phone (optional)
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977 …" maxLength={30} />
        </label>
      </div>
      <label className={label}>
        Notes for the hotel (optional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Early check-in, extra bed, airport pickup…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      {room && nights ? (
        <div className="rounded-md bg-muted p-4 text-sm" role="status">
          <p>
            {room.name} · {nights} {nights === 1 ? "night" : "nights"} · {roomCount}{" "}
            {roomCount === 1 ? "room" : "rooms"} · up to {maxGuests} guests
          </p>
          <p className="mt-1 text-lg font-bold">
            Total: {displayTotal}{" "}
            <span className="text-xs font-normal text-muted-foreground">in {currency} · pay nothing now</span>
          </p>
        </div>
      ) : null}
      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {formError}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/hotels/${hotelSlug}`}>Back to hotel</Link>
        </Button>
        <Button type="submit" disabled={phase === "sending"}>
          {phase === "sending" ? "Sending…" : "Request booking"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Final price is confirmed server-side at booking time. No payment now.
      </p>
    </form>
  );
}
