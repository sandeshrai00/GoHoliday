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

export default function BookingsList() {
  const { getToken } = useAuth();
  const { formatUsd } = useCurrency();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/bookings", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { bookings: Booking[] };
        if (!cancelled) setBookings(data.bookings);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  if (error) {
    return (
      <div className="rounded-xl border p-8 text-center" role="alert">
        <p className="font-medium">Bookings unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (!bookings) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">No trips yet</p>
        <p className="mt-1 text-sm text-muted-foreground">When you book a trip, it will show up here.</p>
        <Button asChild className="mt-4">
          <Link href="/packages">Browse trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {bookings.map((b) => (
        <li key={b.id}>
          <Link
            href={`/bookings/${b.id}`}
            className="flex flex-col gap-2 rounded-xl border p-5 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold">{b.booking_ref}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 font-medium">{b.package_title}</p>
              <p className="text-sm text-muted-foreground">
                {b.destination} · {fmtDate(b.start_date)} → {fmtDate(b.end_date)} ·{" "}
                {b.adults + b.children} {b.adults + b.children === 1 ? "traveler" : "travelers"}
              </p>
            </div>
            <p className="text-lg font-bold sm:text-right">{formatUsd(b.total_price_cents)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
