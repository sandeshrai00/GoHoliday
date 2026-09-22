"use client";

import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import StatusBadge from "@/components/site/status-badge";
import { formatPrice } from "@/lib/pricing";
import { adminFetch } from "../../_components/admin-fetch";
import type { AdminHotelBooking } from "@/lib/hotels";
import type { BookingStatus } from "@/types";

const NEXT_ACTIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export default function AdminHotelBookingsPage() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<AdminHotelBooking[] | null>(null);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<AdminHotelBooking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(getToken, `/hotel-bookings${filter ? `?status=${filter}` : ""}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data.bookings);
    } catch {
      setError("Could not load bookings.");
    }
  }, [getToken, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (booking: AdminHotelBooking, status: BookingStatus) => {
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(getToken, `/hotel-bookings/${booking.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Status change failed.");
        setBusy(false);
        return;
      }
      setSelected(data);
      await load();
    } catch {
      setError("Status change failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hotel bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {bookings === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="mt-4 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No bookings{filter ? ` with status ${filter}` : " yet"}.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Ref</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Hotel · room</th>
                <th className="px-4 py-2 font-medium">Dates</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} onClick={() => setSelected(b)} className="cursor-pointer hover:bg-muted/40">
                  <td className="px-4 py-2 font-semibold">{b.booking_ref}</td>
                  <td className="max-w-[180px] truncate px-4 py-2">{b.customer_email ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-4 py-2">
                    {b.hotel_name} · {b.room_type_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {b.start_date} → {b.end_date}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {formatPrice(b.total_price_display, b.currency_code)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <Dialog title={selected.booking_ref} onClose={() => setSelected(null)} locked={busy}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="text-right">{selected.customer_email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Hotel</dt>
              <dd className="text-right">{selected.hotel_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="text-right">
                {selected.room_type_name} × {selected.rooms}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Stay</dt>
              <dd>
                {selected.start_date} → {selected.end_date} ({selected.nights}{" "}
                {selected.nights === 1 ? "night" : "nights"})
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Guests</dt>
              <dd>{selected.adults + selected.children}</dd>
            </div>
            {selected.contact_phone ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{selected.contact_phone}</dd>
              </div>
            ) : null}
            {selected.notes ? (
              <div>
                <dt className="text-muted-foreground">Requests</dt>
                <dd className="mt-1 rounded-md bg-muted p-2">{selected.notes}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-bold">
                {formatPrice(selected.total_price_display, selected.currency_code)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={selected.status} />
              </dd>
            </div>
          </dl>
          {NEXT_ACTIONS[selected.status].length > 0 ? (
            <div className="mt-4 flex justify-end gap-2">
              {NEXT_ACTIONS[selected.status].map((next) => (
                <Button
                  key={next}
                  variant={next === "cancelled" ? "destructive" : "default"}
                  disabled={busy}
                  onClick={() => setStatus(selected, next)}
                >
                  {busy ? "…" : `Mark ${next}`}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-right text-xs text-muted-foreground">Terminal state — no further actions.</p>
          )}
        </Dialog>
      ) : null}
    </div>
  );
}
