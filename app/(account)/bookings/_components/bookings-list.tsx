"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/site/status-badge";
import { useCurrency } from "@/components/site/use-currency";
import type { Booking, HotelBooking } from "@/types";

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

type Row =
  | { kind: "tour"; created_at: string; booking: Booking }
  | { kind: "hotel"; created_at: string; booking: HotelBooking };

export default function BookingsList() {
  const { getToken } = useAuth();
  const { formatUsd } = useCurrency();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [tours, hotels] = await Promise.all([
          fetch("/api/bookings", { headers }).then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.json() as Promise<{ bookings: Booking[] }>;
          }),
          fetch("/api/hotel-bookings", { headers }).then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.json() as Promise<{ bookings: HotelBooking[] }>;
          }),
        ]);
        if (cancelled) return;
        const merged: Row[] = [
          ...tours.bookings.map((booking): Row => ({ kind: "tour", created_at: booking.created_at, booking })),
          ...hotels.bookings.map((booking): Row => ({ kind: "hotel", created_at: booking.created_at, booking })),
        ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
        setRows(merged);
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

  if (!rows) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">No trips yet</p>
        <p className="mt-1 text-sm text-muted-foreground">When you book a trip or a hotel, it will show up here.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild>
            <Link href="/packages">Browse trips</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/hotels">Browse hotels</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {rows.map((row) => {
        const b = row.booking;
        const guests = b.adults + b.children;
        return (
          <li key={`${row.kind}-${b.id}`}>
            <Link
              href={row.kind === "tour" ? `/bookings/${b.id}` : `/hotel-bookings/${b.id}`}
              className="flex flex-col gap-2 rounded-xl border p-5 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{b.booking_ref}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {row.kind === "tour" ? "Tour" : "Hotel"}
                  </span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 font-medium">
                  {row.kind === "tour" ? b.package_title : `${b.hotel_name} · ${b.room_type_name}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {row.kind === "tour" ? b.destination : `${b.nights} ${b.nights === 1 ? "night" : "nights"}`} ·{" "}
                  {fmtDate(b.start_date)} → {fmtDate(b.end_date)} · {guests}{" "}
                  {guests === 1 ? "traveler" : "travelers"}
                </p>
              </div>
              <p className="text-lg font-bold sm:text-right">{formatUsd(b.total_price_cents)}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
