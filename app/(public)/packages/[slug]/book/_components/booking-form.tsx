"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/components/site/use-currency";
import { convertFromUsd, formatPrice } from "@/lib/pricing";
import type { Booking } from "@/types";

interface Props {
  packageId: string;
  slug: string;
  title: string;
  destination: string;
  baseCents: number;
}

type Phase = "form" | "sending" | "done";

export default function BookingForm({ packageId, slug, title, destination, baseCents }: Props) {
  const initial = useSearchParams();
  const { isSignedIn, getToken } = useAuth();
  const { currency, rates } = useCurrency();

  const [start, setStart] = useState(initial.get("start") ?? "");
  const [end, setEnd] = useState(initial.get("end") ?? "");
  const [adults, setAdults] = useState(Number(initial.get("adults")) || 2);
  const [children, setChildren] = useState(Number(initial.get("children")) || 0);
  const [rooms, setRooms] = useState(1);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [formError, setFormError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const travelers = adults + children;
  const total = baseCents * travelers;
  const nights = useMemo(() => {
    if (!start || !end) return null;
    const n = Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
    return n >= 1 ? n : null;
  }, [start, end]);
  const displayTotal = formatPrice(convertFromUsd(total, rates[currency] ?? 1), currency);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!start || !end || nights === null) {
      setFormError("Pick a valid start and end date.");
      return;
    }
    const token = await getToken().catch(() => null);
    if (!token) {
      setFormError("Your session expired. Please sign in again.");
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          package_id: packageId,
          start_date: start,
          end_date: end,
          adults,
          children,
          rooms,
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
      setBooking(data as Booking);
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
          {title} · {booking.start_date} → {booking.end_date} · {booking.adults + booking.children}{" "}
          {booking.adults + booking.children === 1 ? "traveler" : "travelers"}
        </p>
        <p className="mt-1 text-lg font-bold">{displayTotal}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Status: <strong>pending</strong> — our team confirms availability and shares payment
          instructions. Nothing is charged now.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/packages">Browse more trips</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/packages/${slug}`}>Back to trip</Link>
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

  const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Start date
            <input type="date" required value={start} onChange={(e) => setStart(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium">
            End date
            <input type="date" required value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium">
            Adults
            <input type="number" required min={1} max={20} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium">
            Children
            <input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} className={`${inputClass} mt-1`} />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Rooms
          <input type="number" min={1} max={20} value={rooms} onChange={(e) => setRooms(Math.max(1, Number(e.target.value) || 1))} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium">
          Phone <span className="font-normal text-muted-foreground">(optional, for confirmation updates)</span>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+66 …" maxLength={30} className="mt-1" />
        </label>
        <label className="block text-sm font-medium">
          Special requests <span className="font-normal text-muted-foreground">(optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Dietary needs, accessibility, honeymoon touches…"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        {formError ? (
          <p role="alert" className="text-sm font-medium text-red-600">
            {formError}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={phase === "sending"} className="w-full sm:w-auto">
          {phase === "sending" ? "Sending request…" : "Request booking"}
        </Button>
      </div>
      <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-24" aria-label="Price summary">
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{destination}</p>
        <dl className="mt-4 space-y-1.5 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Dates</dt>
            <dd>{start && end ? `${start} → ${end}` : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Travelers</dt>
            <dd>{travelers}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Rooms</dt>
            <dd>{rooms}</dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Total</dt>
            <dd>{displayTotal}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Final price is confirmed server-side at booking time. No payment now.
        </p>
      </aside>
    </form>
  );
}
