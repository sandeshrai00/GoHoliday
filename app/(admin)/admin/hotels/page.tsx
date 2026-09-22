"use client";

import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { adminFetch } from "../../_components/admin-fetch";
import type { AdminHotel } from "@/lib/hotels";
import HotelForm from "./_components/hotel-form";

export default function AdminHotelsPage() {
  const { getToken } = useAuth();
  const [hotels, setHotels] = useState<AdminHotel[] | null>(null);
  const [editing, setEditing] = useState<AdminHotel | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminHotel | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(getToken, "/hotels");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHotels(data.hotels);
    } catch {
      setError("Could not load hotels.");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (hotel: AdminHotel) => {
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(getToken, `/hotels/${hotel.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: hotel.name,
          slug: hotel.slug,
          location: hotel.location,
          region: hotel.region,
          star_rating: hotel.star_rating,
          short_description: hotel.short_description,
          description: hotel.description,
          gallery_urls: hotel.gallery.map((g) => g.url),
          amenities: hotel.amenities,
          check_in_time: hotel.check_in_time,
          check_out_time: hotel.check_out_time,
          room_types: hotel.room_types.map((r) => ({
            name: r.name,
            price_per_night_usd: Math.round(r.price_cents_per_night / 100),
            max_guests: r.max_guests,
            description: r.description,
          })),
          policies: hotel.policies ?? "",
          status: hotel.status === "published" ? "draft" : "published",
          featured: hotel.featured,
        }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not change status.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(getToken, `/hotels/${deleting.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Delete failed.");
        setBusy(false);
        return;
      }
      setDeleting(null);
      await load();
    } catch {
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hotels</h1>
        <Button onClick={() => setCreating(true)}>+ New hotel</Button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {hotels === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Hotel</th>
                <th className="px-4 py-2 font-medium">From / night</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Bookings</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td className="px-4 py-2">
                    <p className="font-semibold">
                      {hotel.featured ? "★ " : ""}
                      {hotel.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {"★".repeat(hotel.star_rating)} · {hotel.location} · {hotel.room_types.length}{" "}
                      {hotel.room_types.length === 1 ? "room" : "rooms"} · /{hotel.slug}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">${Math.round(hotel.from_price_cents / 100)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        hotel.status === "published" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {hotel.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{hotel.booking_count}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(hotel)} disabled={busy}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(hotel)} disabled={busy}>
                      {hotel.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(hotel)}
                      disabled={busy}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating ? (
        <Dialog title="New hotel" size="xl" onClose={() => setCreating(false)} locked={false}>
          <HotelForm
            onClose={() => setCreating(false)}
            onSaved={() => {
              setCreating(false);
              load();
            }}
          />
        </Dialog>
      ) : null}
      {editing ? (
        <Dialog title={`Edit — ${editing.name}`} size="xl" onClose={() => setEditing(null)} locked={false}>
          <HotelForm
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        </Dialog>
      ) : null}
      {deleting ? (
        <Dialog title="Delete hotel?" onClose={() => setDeleting(null)} locked={busy}>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{deleting.name}</strong> will be removed permanently.
            {deleting.booking_count > 0 ? (
              <> This hotel has {deleting.booking_count} bookings — deletion will be blocked.</>
            ) : null}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busy}>
              {busy ? "Deleting…" : "Yes, delete"}
            </Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
