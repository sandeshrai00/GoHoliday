"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/site/status-badge";
import { useCurrency } from "@/components/site/use-currency";
import { convertFromUsd, formatPrice } from "@/lib/pricing";
import type { HotelBooking } from "@/types";

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function HotelBookingDetail({ id }: { id: string }) {
  const { getToken } = useAuth();
  const { currency, rates } = useCurrency();
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/hotel-bookings/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          if (!cancelled) setMissing(true);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as HotelBooking;
        if (!cancelled) setBooking(data);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, id]);

  if (missing) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">Booking not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed, or this link belongs to another account.</p>
        <Button asChild className="mt-4">
          <Link href="/bookings">Back to my bookings</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-8 text-center" role="alert">
        <p className="font-medium">Booking unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const guests = booking.adults + booking.children;
  const nightly = formatPrice(convertFromUsd(booking.price_per_night_cents, rates[currency] ?? 1), currency);

  return (
    <div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/bookings">← All bookings</Link>
      </Button>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-2xl font-bold">{booking.booking_ref}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-muted-foreground">
        {booking.hotel_name} · {booking.room_type_name}
      </p>

      <section aria-label="Stay" className="mt-6 rounded-xl border p-5">
        <h2 className="font-semibold">Stay</h2>
        <dl className="mt-2 divide-y">
          <Row label="Check-in" value={fmtDate(booking.start_date)} />
          <Row label="Check-out" value={fmtDate(booking.end_date)} />
          <Row label="Nights" value={String(booking.nights)} />
          <Row
            label="Rooms"
            value={`${booking.rooms} × ${booking.room_type_name} (${nightly} / night)`}
          />
          <Row
            label="Guests"
            value={`${guests} (${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children > 0 ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""})`}
          />
        </dl>
      </section>

      <section aria-label="Contact" className="mt-4 rounded-xl border p-5">
        <h2 className="font-semibold">Contact</h2>
        <dl className="mt-2 divide-y">
          <Row label="Email" value={booking.contact_email ?? "—"} />
          <Row label="Phone" value={booking.contact_phone ?? "—"} />
          {booking.notes ? <Row label="Notes" value={booking.notes} /> : null}
        </dl>
      </section>

      <section aria-label="Price" className="mt-4 rounded-xl border p-5">
        <h2 className="font-semibold">Price</h2>
        <dl className="mt-2 divide-y">
          <Row label="Per night / room" value={nightly} />
          <Row
            label={`${booking.nights} ${booking.nights === 1 ? "night" : "nights"} × ${booking.rooms} ${booking.rooms === 1 ? "room" : "rooms"}`}
            value={formatPrice(convertFromUsd(booking.total_price_cents, rates[currency] ?? 1), currency)}
          />
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Price snapshot taken at booking time — rate changes never rewrite it.</p>
      </section>

      <section aria-label="Status" className="mt-4 rounded-xl border p-5">
        <h2 className="font-semibold">Status</h2>
        <ol className="mt-3 flex flex-col gap-3">
          <li className="flex gap-3 text-sm">
            <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div>
              <p className="font-medium">Requested</p>
              <p className="text-muted-foreground">{fmtDateTime(booking.created_at)}</p>
            </div>
          </li>
          {booking.status !== "pending" ? (
            <li className="flex gap-3 text-sm">
              <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium capitalize">{booking.status}</p>
                <p className="text-muted-foreground">{fmtDateTime(booking.updated_at)}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </section>
    </div>
  );
}
