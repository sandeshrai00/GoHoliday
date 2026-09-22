"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/site/status-badge";
import { useCurrency } from "@/components/site/use-currency";
import type { Booking } from "@/types";

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

export default function BookingDetail({ id }: { id: string }) {
  const { getToken } = useAuth();
  const { formatUsd } = useCurrency();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/bookings/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          if (!cancelled) setMissing(true);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Booking;
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

  const travelers = booking.adults + booking.children;

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
        {booking.package_title} · {booking.destination}
      </p>

      <section aria-label="Trip" className="mt-6 rounded-xl border p-5">
        <h2 className="font-semibold">Trip</h2>
        <dl className="mt-2 divide-y">
          <Row label="Departure" value={fmtDate(booking.start_date)} />
          <Row label="Return" value={fmtDate(booking.end_date)} />
          <Row label="Travelers" value={`${travelers} (${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children > 0 ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""})`} />
          <Row label="Rooms" value={String(booking.rooms)} />
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
          <Row label={`Total · ${travelers} traveler${travelers === 1 ? "" : "s"}`} value={formatUsd(booking.total_price_cents)} />
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
